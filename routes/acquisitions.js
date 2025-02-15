const express = require("express");
const Joi = require("joi");
const generate = require("./lib/generateCopies");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const librarianAuth = require("../middleware/auth/librarian");
const permission = require("../middleware/auth/permissions");

const prisma = new PrismaClient();

router.get("/", librarianAuth, async (req, res) => {
  const acquisition = await prisma.acquisition.findMany({
    include: {
      book: true,
      librarian: true,
      institution: true,
      supplier: true,
    },
  });
  res.send(acquisition);
});

router.get("/:id", async (req, res) => {
  const acquisition = await prisma.acquisition.findUnique({
    where: { id: req.params.id },
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

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const copies = generate(req.body);
  
  const LIMIT = 300;
  if (copies.length > LIMIT) return res.status(400).send(`The acquired books exceed the limit of ${LIMIT}.`);
  
  let check = `${req.body.quantity}/${req.body.code}`;
  const isFound = await prisma.bookCopy.findFirst({where: {code: {contains: check}}});
  if (isFound) return res.status(400).send(`Book ending with code: ${check} already exists!`);


  await prisma.$transaction([
    prisma.acquisition.create({
      data: {
        book: req.body.bookId,
        quantity: req.body.quantity,
        librarian: req.body.librarianId,
        doneOn: new Date(),
        institution: req.body.institutionId,
        supplier: req.body.supplierId,
        book: {
          connect: { id: req.body.bookId },
        },
        institution: {
          connect: { id: req.body.institutionId },
        },
        librarian: {
          connect: { librarianId: req.body.librarianId },
        },
        supplier: {
          connect: { id: req.body.supplierId },
        },
      },
    }),
    prisma.bookCopy.createMany({ data: copies }),
  ]);

  const book = await prisma.book.findFirst({where: {id: req.body.bookId}});
  const supplier = await prisma.supplier.findFirst({where: {id: req.body.supplierId}});

  res.status(201).send(`${req.body.quantity} books of ${book.title} acquired from ${supplier.name}.`);
});

function validate(acquisition) {
  const schema = Joi.object({
    bookId: Joi.string().uuid().required(),
    quantity: Joi.number().integer().required(),
    librarianId: Joi.string().uuid().required(),
    doneOn: Joi.date().iso().required(),
    institutionId: Joi.string().uuid().required(),
    supplierId: Joi.string().uuid().required(),
    code: Joi.string().required(),
    libraryId: Joi.string().uuid().required(),
    dateOfAcquisition: Joi.date().iso().required()
  });
  return schema.validate(acquisition);
}

module.exports = router;
