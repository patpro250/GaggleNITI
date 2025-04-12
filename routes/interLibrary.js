const express = require("express");
const Joi = require("joi");
const now = require("../routes/lib/now");

const prisma = require("./prismaClient");
const permission = require("../middleware/auth/permissions");
const { tr } = require("@faker-js/faker");

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

router.post("/request", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const borrower = await prisma.institution.findFirst({
    where: { id: req.user.institutionId },
  });
  if (!borrower) return res.status(400).send("Borrower not found");

  const pendingApproval = await prisma.interLibrary.findFirst({
    where: {
      borrowerId: borrower.id,
      status: "PENDING",
    },
  });
  if (pendingApproval)
    return res
      .status(400)
      .send(`You can't request a book when you still have a pending request!`);

  const lender = await prisma.institution.findFirst({
    where: { id: req.body.lenderId },
  });
  if (!lender) return res.status(400).send("Lender not found");

  if (lender.id === borrower.id)
    return res
      .status(400)
      .send("The borrower and lender are the same, try again");

  let book = await prisma.book.findFirst({
    where: { id: req.body.copyId, institutionId: req.body.lenderId },
  });
  if (!book)
    return res
      .status(400)
      .send(
        `The book you want doesn't exist in ${lender.name}, try another one!`
      );

  const availableCopies = await prisma.bookCopy.count({
    where: { status: "AVAILABLE", bookId: req.body.bookId },
  });
  if (availableCopies === 0)
    return res
      .status(404)
      .send(`There is no available copies of ${book.title} in ${lender.name}.`);

  await prisma.interLibrary.create({
    data: {
      lenderId: req.body.lenderId,
      bookId: req.body.bookId,
      quantity: req.body.quantity,
      borrowerId: req.user.institutionId,
    },
  });

  res
    .status(200)
    .send(
      `${borrower.name}, you have requested ${req.body.quantity} books of ${book.title} in ${lender.name}, please wait for approval.`
    );
});

router.post("/approve/:id", async (req, res) => {
  const { copies } = req.body;
  const { error } = validateApproval(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let isApproved = await prisma.interLibrary.findFirst({
    where: { AND: [{ id: req.params.id }, { status: "PENDING" }] },
  });
  if (!isApproved)
    return res
      .status(400)
      .send(`The inter library transaction is not pending!`);

  let lender = await prisma.interLibrary.findFirst({
    where: {
      AND: [{ id: req.params.id }, { lenderId: req.user.institutionId }],
    },
  });
  if (!lender) return res.status(400).send(`You are not requested this book`);

  const records = await prisma.bookCopy.findMany({
    where: {
      id: {
        in: req.body.copies,
      },
      bookId: isApproved.bookId,
      status: "AVAILABLE",
    },
    select: {
      id: true,
    },
  });

  if (records.length !== copies.length)
    return res
      .status(400)
      .send(
        `One of the copies you provided is not Available, try again but change the provided copies!`
      );

  await prisma.$transaction([
    prisma.interLibrary.update({
      where: { id: req.params.id },
      data: {
        status: "APPROVED",
        copies,
      },
    }),
    prisma.bookCopy.updateMany({
      where: { id: { in: copies } },
      data: { status: "REQUESTED" },
    }),
  ]);
  let book = await prisma.book.findFirst({ where: { id: isApproved.bookId } });
  res
    .status(200)
    .send(
      `${copies.length} books of ${book.title} with author: ${book.author}, publisher: ${book.publisher} approved successfully, go and take them!`
    );
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

router.post("/send/:id", async (req, res) => {
  const { error } = validateSend(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const transaction = await prisma.interLibrary.findFirst({
    where: {
      id: req.params.id,
      status: "APPROVED",
      lenderId: req.user.institutionId,
    },
  });
  if (!transaction)
    return res
      .status(400)
      .send(`There is not an Approved inter library transaction.`);

  const copies = transaction.copies;
  const dueDate = new Date(req.body.dueDate);
  const doneAt = new Date(transaction.updatedAt);

  if (dueDate < doneAt)
    return res
      .status(400)
      .send(`The due date should be greater than the date of approval!`);

  await prisma.$transaction([
    prisma.interLibrary.update({
      where: { id: req.params.id },
      data: { status: "RECEIVED", dueDate: req.body.dueDate },
    }),
    prisma.bookCopy.updateMany({
      where: {
        id: {
          in: copies,
        },
      },
      data: {
        status: "CHECKEDOUT",
      },
    }),
  ]);

  const book = await prisma.book.findFirst({
    where: { id: transaction.bookId },
    select: { title: true },
  });
  const borrower = await prisma.institution.findFirst({
    where: { id: transaction.borrowerId },
    select: { name: true },
  });
  const lender = await prisma.institution.findFirst({
    where: { id: transaction.lenderId },
    select: { name: true },
  });

  res
    .status(200)
    .send(
      `${borrower.name}, you have received ${copies.length} books of ${
        book.title
      } from ${lender.name}, please return it before ${new Date(
        transaction.dueDate
      ).toDateString()}`
    );
});

router.post("/reject/:id", async (req, res) => {
  const { error } = validateRejection(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let transaction = await prisma.interLibrary.findFirst({
    where: { id: req.params.id, lenderId: req.user.institutionId },
  });
  if (!transaction)
    return res
      .status(400)
      .send(`There is no active inter library transaction!`);

  const copies = transaction.copies;

  await prisma.$transaction([
    prisma.interLibrary.update({
      where: {
        id: req.params.id,
      },
      data: {
        status: "REJECTED",
        reason: req.body.reason,
      },
    }),
    prisma.bookCopy.updateMany({
      where: {
        id: { in: copies },
      },
      data: {
        status: "AVAILABLE",
      },
    }),
  ]);

  res.status(200).send(`The inter library request was successfully rejected`);
});

router.post("/return/:id", async (req, res) => {
  const { error } = validateReturn(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const returned = await prisma.interLibrary.findFirst({
    where: {
      id: req.params.id,
      status: "RETURNED",
      lenderId: req.user.institutionId,
    },
  });
  if (returned)
    return res
      .status(400)
      .send(`This transaction is already ${returned.status}.`);

  const borrower = await prisma.institution.findFirst({
    where: { email: req.body.email },
    select: { id: true },
  });
  if (!borrower) return res.status(404).send(`Borrower not found!`);

  const transaction = await prisma.interLibrary.findFirst({
    where: { lenderId: req.user.institutionId, id: req.params.id },
  });
  if (!transaction)
    return res
      .status(404)
      .send(`You are not the appropriate lender of the book!`);

  const copiesFromUser = req.body.copies;
  const copiesFromDB = transaction.copies;

  const returnedBooksCount = await prisma.bookCopy.count({
    where: {
      id: {
        in: copiesFromDB,
      },
      status: "AVAILABLE",
      bookId: transaction.bookId,
    },
  });

  let status = "";
  const totalCopies = copiesFromDB.length;
  const totalReturnedCopies = returnedBooksCount + copiesFromUser.length;

  if (totalReturnedCopies === totalCopies) {
    status = "RETURNED";
  } else {
    status = "PARTIALLY_RETURNED";
  }

  await prisma.$transaction([
    prisma.interLibrary.update({
      where: { id: req.params.id },
      data: {
        status,
        returnDate: new Date(),
      },
    }),

    prisma.bookCopy.updateMany({
      where: { id: { in: copiesFromUser } },
      data: { status: "AVAILABLE" },
    }),
  ]);

  let book = await prisma.book.findFirst({ where: { id: transaction.bookId } });

  res
    .status(200)
    .send(
      `${copiesFromUser.length} copies of ${book.title} was successfully returned`
    );
});

function validate(request) {
  const schema = Joi.object({
    lenderId: Joi.string().uuid().required(),
    bookId: Joi.string().uuid().required(),
    quantity: Joi.number().positive().required(),
  });
  return schema.validate(request);
}

function validateApproval(request) {
  const schema = Joi.object({
    copies: Joi.array().items(Joi.string()).required(),
  });
  return schema.validate(request);
}

function validateRejection(request) {
  const schema = Joi.object({
    reason: Joi.string().min(5),
  });
  return schema.validate(request);
}

function validateSend(req) {
  const schema = Joi.object({
    dueDate: Joi.date().iso().required(),
  });
  return schema.validate(req);
}

function validateReturn(request) {
  const schema = Joi.object({
    email: Joi.string().email(),
    copies: Joi.array().items(Joi.string()).required(),
  });
  return schema.validate(request);
}
module.exports = router;
