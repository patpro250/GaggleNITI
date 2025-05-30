const express = require("express");
const Joi = require("joi");
const generate = require("./generateCopies");
const router = express.Router();

const permission = require("../middleware/auth/permissions");

const prisma = require("./prismaClient");

router.get("/", permission(["READ"]), async (req, res) => {
  let { cursor, limit, sort } = req.query;
  limit = parseInt(limit) || 10;

  const orderBy = sort === "asc" ? { doneOn: "asc" } : { doneOn: "desc" };

  if (limit > 50) limit = 50;
  const acquisitions = await prisma.acquisition.findMany({
    where: {
      libraryId: req.user.libraryId,
    },
    include: {
      book: true,
      librarian: true,
      Library: true,
      supplier: true,
    },
    orderBy,
    take: limit,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
  });
  const nextCursor =
    acquisitions.length === limit
      ? acquisitions[acquisitions.length - 1].id
      : null;
  res.send({ nextCursor, acquisitions });
});

router.get('/overview', async (req, res) => {
  const { libraryId } = req.user;
  const suppliersGrouped = await prisma.acquisition.groupBy({
    by: ['supplierId'],
    where: { libraryId }
  });
  const totalSuppliers = suppliersGrouped.length;
  const totalAcquired = await prisma.acquisition.count({ where: { libraryId } });
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const acquiredThisMonth = await prisma.acquisition.count({
    where: {
      libraryId,
      doneOn: { gte: startOfMonth }
    }
  });

  const suppliersStats = {
    totalSuppliers: totalSuppliers.toLocaleString(),
    totalAcquired: totalAcquired.toLocaleString(),
    acquiredThisMonth: acquiredThisMonth.toLocaleString()
  };

  res.status(200).send(suppliersStats);
});

router.get("/:id", permission(["READ"]), async (req, res) => {
  const acquisition = await prisma.acquisition.findFirst({
    where: {
      AND: [{ id: req.params.id }, { institutionId: req.user.institutionId }],
    },
    include: {
      book: true,
      librarian: true,
      institution: true,
      supplier: true,
    },
  });

  if (!acquisition) return res.status(404).send("Acquisition not found!");
  res.send(acquisition);
});

router.post("/", permission(["ACQUIRE"]), async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const LIMIT = 300;
  if (parseInt(req.body.quantity) > LIMIT)
    return res
      .status(400)
      .send(`The acquired books exceed the limit of ${LIMIT}.`);

  const copies = await generate(req.body);

  await prisma.$transaction([
    prisma.acquisition.create({
      data: {
        book: req.body.bookId,
        quantity: req.body.quantity,
        librarian: req.user.librarianId,
        doneOn: new Date(),
        libraryId: req.body.libraryId,
        supplier: req.body.supplierId,
        book: {
          connect: { id: req.body.bookId },
        },
        Library: {
          connect: { id: req.body.libraryId },
        },
        librarian: {
          connect: { librarianId: req.user.librarianId },
        },
        supplier: {
          connect: { id: req.body.supplierId },
        },
      },
    }),
    prisma.bookCopy.createMany({ data: copies }),
  ]);

  const book = await prisma.book.findFirst({ where: { id: req.body.bookId } });
  const supplier = await prisma.supplier.findFirst({
    where: { id: req.body.supplierId },
  });

  res
    .status(201)
    .send(
      `${req.body.quantity} books of ${book.title} acquired from ${supplier.name}.`
    );
});

function validate(acquisition) {
  const schema = Joi.object({
    bookId: Joi.string().uuid().required(),
    quantity: Joi.number().integer().required(),
    doneOn: Joi.date().iso().required(),
    supplierId: Joi.string().uuid().required(),
    code: Joi.string().required(),
    libraryId: Joi.string().uuid().required(),
    dateOfAcquisition: Joi.date().iso().required(),
  });
  return schema.validate(acquisition);
}

module.exports = router;
