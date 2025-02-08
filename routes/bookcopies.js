const express = require("express");
const Joi = require("joi");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.get('/dashboard', async (req, res) => {
  const totalBooks = await prisma.bookCopy.count();
  const issued = await prisma.bookCopy.count({where: {status: 'CHECKEDOUT'}});
  const available = await prisma.bookCopy.count({where: {status: 'AVAILABLE'}});
  const returned = await prisma.circulation.count({where: {returnDate: {not: null}}});

  const stats = {
    totalBooks,
    issued,
    available,
    returned,
  };
  res.status(200).send(stats);
});

router.get("/", async (req, res) => {
  const bookcopies = await prisma.BookCopy.findMany({take: 10});
  if (bookcopies.length > 0) return res.status(200).send(bookcopies);
  res.status(404).send("No BookCopy Found");
});

router.get('/:id', async (req, res) => {
  const bookCopy = await prisma.bookCopy.findUnique({where: {id: req.params.id}})
  if (!bookCopy) return res.status(404).send("BookCopy not found");
  res.status(200).send(bookCopy);
})

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const library = await prisma.library.findUnique({
    where: { id: req.body.libraryId },
  });

  if (!library) return res.status(404).send("Library not found");

  await prisma.bookCopy.create({
    data: req.body,
  });

  res.status(201).send(`${req.body.bookId} bookCopy Is Created`);
});

router.delete("/:id", async (req, res) => {
  const bookcopy = await prisma.bookCopy.findUnique({
    where: { id: req.params.id },
  });

  if (!bookcopy) return res.status(404).send("BookCopy not found");

  await prisma.bookCopy.delete({
    where: { id: req.params.id },
  });

  res.status(200).send("BookCopy Deleted");
});

function validate(bookcopy) {
  const schema = Joi.object({
    bookId: Joi.string().required(),
    status: Joi.string(),
    libraryId: Joi.string().required(),
    condition: Joi.string(),
    dateOfAquisition: Joi.date(),
    code: Joi.string().required(),
  });

  return schema.validate(bookcopy);
}

module.exports = router;
