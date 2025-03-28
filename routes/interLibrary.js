const express = require("express");
const Joi = require("joi");
const now = require("../routes/lib/now");

const prisma = require("./prismaClient");

const permission = require("../middleware/auth/permissions");

const router = express.Router();

router.use(permission(["CIRCULATION_MANAGER"]));

router.get("/", async (req, res) => {
  const interLibrary = await prisma.interLibrary.findMany();
  res.status(200).send(interLibrary);
});

router.get("/my", async (req, res) => {
  const interLibrary = await prisma.interLibrary.findFirst({
    where: { lenderId: req.user.institutionId },
  });
  if (!interLibrary)
    return res.status(404).send(`You have no inter library activities.`);
  res.status(200).send(interLibrary);
});

router.get("/approved", async (req, res) => {
  const interLibrary = await prisma.interLibrary.findFirst({
    where: {
      AND: [{ lenderId: req.user.institutionId }, { status: "APPROVED" }],
    },
  });
  if (!interLibrary)
    return res
      .status(404)
      .send(`You have no approved inter library activities.`);
  res.status(200).send(interLibrary);
});

router.get("/pending", async (req, res) => {
  const interLibrary = await prisma.interLibrary.findFirst({
    where: {
      AND: [{ lenderId: req.user.institutionId }, { status: "PENDING" }],
    },
  });
  if (!interLibrary)
    return res
      .status(404)
      .send(`You have no pending inter library activities.`);
  res.status(200).send(interLibrary);
});

router.get("/rejected", async (req, res) => {
  const interLibrary = await prisma.interLibrary.findFirst({
    where: {
      AND: [{ lenderId: req.user.institutionId }, { status: "REJECTED" }],
    },
  });
  if (!interLibrary)
    return res
      .status(404)
      .send(`You have no rejected inter library activities.`);
  res.status(200).send(interLibrary);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const borrower = await prisma.institution.findFirst({
    where: { id: req.body.borrowerId },
  });
  if (!borrower) return res.status(400).send("Borrower not found");

  const lender = await prisma.institution.findFirst({
    where: { id: req.user.institutionId },
  });
  if (!lender) return res.status(400).send("Lender not found");

  if (lender.id === borrower.id)
    return res
      .status(400)
      .send("The borrower and lender are the same, try again");

  let copy = await prisma.bookCopy.findFirst({
    where: { id: req.body.copyId },
  });
  if (!copy)
    return res
      .status(400)
      .send(
        `Copy with ID: ${req.body.copyId} does not exist, add it to the database.`
      );

  let isPending = await prisma.interLibrary.findFirst({
    where: { AND: [{ bookId: req.body.bookId }, { status: "PENDING" }] },
  });
  if (isPending)
    return res
      .status(400)
      .send(`Another library has already requested for the book`);

  let isAvailable = await prisma.bookCopy.findFirst({
    where: { id: req.body.copyId, status: "AVAILABLE" },
  });
  if (!isAvailable)
    return res.status(400).send(`This book is Available to issue!`);

  req.body.status = "PENDING";
  await prisma.interLibrary.create({
    data: req.body,
  });

  res.status(200).send("Request sent successfully");
});

router.post("/approve/:id", async (req, res) => {
  const { error } = validateApproval(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let isApproved = await prisma.interLibrary.findFirst({
    where: { AND: [{ id: req.params.id }, { status: "PENDING" }] },
  });
  if (!isApproved)
    return res
      .status(400)
      .send(`The book is not found or already CHECKED OUT!`);

  let lender = await prisma.interLibrary.findFirst({
    where: {
      AND: [{ id: req.params.id }, { lenderId: req.user.institutionId }],
    },
  });
  if (!lender)
    return res.status(400).send(`You are not the lender of this book`);

  await prisma.$transaction([
    prisma.interLibrary.update({
      where: { id: req.params.id },
      data: {
        status: "APPROVED",
        dueDate: req.body.dueDate,
      },
    }),
    prisma.bookCopy.update({
      where: { id: isApproved.bookId },
      data: { status: "CHECKEDOUT" },
    }),
  ]);
  let book = await prisma.book.findFirst({ where: { id: isApproved.bookId } });

  res
    .status(200)
    .send(
      `${book.title} with author: ${book.author}, publisher: ${book.publisher} requested successfully!`
    );
});

router.post("/reject/:id", async (req, res) => {
  const { error } = validateRejection(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let isApproved = await prisma.interLibrary.findFirst({
    where: { AND: [{ id: req.params.id }, { status: "PENDING" }] },
  });

  if (!isApproved)
    return res
      .status(400)
      .send(`The book is not found or already CHECKED OUT!`);

  let lender = await prisma.interLibrary.findFirst({
    where: { AND: [{ id: req.params.id }, { lenderId: req.body.lenderId }] },
  });

  if (!lender)
    return res.status(400).send(`You are not the lender of this book`);

  await prisma.$transaction([
    prisma.interLibrary.update({
      where: { id: req.params.id },
      data: {
        status: "REJECTED",
      },
    }),
    prisma.bookCopy.update({
      where: { id: isApproved.bookId },
      data: { status: "AVAILABLE" },
    }),
  ]);

  res.status(200).send(`The inter library request was successfully rejected`);
});

router.post("/return/:id", async (req, res) => {
  const { error } = validateReturn(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const borrower = await prisma.interLibrary.findFirst({
    where: { borrowerId: req.body.borrowerId },
  });
  if (!borrower)
    return res
      .status(404)
      .send(`Borrower not found or not the appropriate borrower of the book!`);

  const copy = await prisma.bookCopy.findFirst({
    where: { id: req.body.copyId },
  });
  if (!copy) return res.status(404).send(`Book copy not found!`);

  if (copy.status !== "CHECKEDOUT")
    return res
      .status(400)
      .send(`This book is not issued, it is ${copy.status}`);

  await prisma.$transaction([
    prisma.interLibrary.update({
      where: { id: req.params.id },
      data: {
        status: "RETURNED",
        returnDate: new Date(),
      },
    }),

    prisma.bookCopy.update({
      where: { id: req.body.copyId },
      data: { status: "AVAILABLE" },
    }),
  ]);

  let book = await prisma.book.findFirst({ where: { id: copy.bookId } });

  res.status(200).send(`${book.title} was successfully returned`);
});

function validate(request) {
  const schema = Joi.object({
    lenderId: Joi.string().uuid().required(),
    borrowerId: Joi.string().uuid().required(),
    bookId: Joi.string().uuid().required(),
  });
  return schema.validate(request);
}

function validateApproval(request) {
  const schema = Joi.object({
    lenderId: Joi.string().uuid().required(),
    dueDate: Joi.date().iso().required(),
  });
  return schema.validate(request);
}

function validateRejection(request) {
  const schema = Joi.object({
    lenderId: Joi.string().uuid().required(),
  });
  return schema.validate(request);
}

function validateReturn(request) {
  const schema = Joi.object({
    copyId: Joi.string().uuid().required(),
    borrowerId: Joi.string().uuid().required(),
  });
  return schema.validate(request);
}
module.exports = router;
