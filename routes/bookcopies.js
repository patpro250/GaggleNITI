const express = require("express");
const Joi = require("joi");
const librarianAuth = require("../middleware/auth/librarian");
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
  let { cursor, limit, sort } = req.query;
  limit = parseInt(limit) || 10;

  if (limit > 50) limit = 50;
  const orderBy = sort === 'asc' ? { dateOfAcquisition: 'asc' } : { dateOfAcquisition: 'desc' };

  const copies = await prisma.bookCopy.findMany({
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy
  });

  const nextCursor = copies.length === limit ? copies[copies.length - 1].id : null;
  res.status(200).send({ nextCursor, copies });
});

router.get('/:id', async (req, res) => {
  const bookCopy = await prisma.bookCopy.findUnique({where: {id: req.params.id}})
  if (!bookCopy) return res.status(404).send("BookCopy not found");
  res.status(200).send(bookCopy);
})

router.post("/", librarianAuth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let libraryId = req.user.institutionId;
  let library = await prisma.library.findFirst({where: {institutionId: libraryId}});

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
    condition: Joi.string(),
    dateOfAcquisition: Joi.date(),
    code: Joi.string().required(),
  });

  return schema.validate(bookcopy);
}

module.exports = router;
