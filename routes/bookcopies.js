const express = require("express");
const Joi = require("joi");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const permission = require("../middleware/auth/permissions");
const myLibrary = require('../middleware/myLibrary');

const prisma = new PrismaClient();

router.get('/dashboard', myLibrary, async (req, res) => {
  const libraryId = req.user.libraryId;
  const totalBooks = await prisma.bookCopy.count({
    where: { libraryId }
  });

  const issued = await prisma.bookCopy.count({
    where: { status: 'CHECKEDOUT', libraryId }
  });

  const available = await prisma.bookCopy.count({
    where: { status: 'AVAILABLE', libraryId }
  });

  const returned = await prisma.circulation.count({
    where: { returnDate: { not: null }, bookCopy: { libraryId } }
  });

  const newBooks = await prisma.bookCopy.count({
    where: { condition: 'NEW', libraryId }
  });

  const goodBooks = await prisma.bookCopy.count({
    where: { condition: 'GOOD', libraryId }
  });

  const damagedBooks = await prisma.bookCopy.count({
    where: { condition: 'DAMAGED', libraryId }
  });

  const onHold = await prisma.bookCopy.count({
    where: { status: 'ONHOLD', libraryId }
  });

  const reserved = await prisma.bookCopy.count({
    where: { status: 'RESERVED', libraryId }
  });

  const inArchives = await prisma.bookCopy.count({
    where: { status: 'INARCHIVES', libraryId }
  });

  const processing = await prisma.bookCopy.count({
    where: { status: 'PROCESSING', libraryId }
  });

  const missing = await prisma.bookCopy.count({
    where: { status: 'MISSING', libraryId }
  });

  const restrictedAccess = await prisma.bookCopy.count({
    where: { status: 'RESTRICTEDACCESS', libraryId }
  });

  const booksThisYear = await prisma.bookCopy.count({
    where: {
      dateOfAcquisition: { gte: new Date(new Date().getFullYear(), 0, 1) },
      libraryId
    }
  });

  const booksThisMonth = await prisma.bookCopy.count({
    where: {
      dateOfAcquisition: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      libraryId
    }
  });

  const inTransit = await prisma.bookCopy.count({
    where: { status: 'INTRANSIT', libraryId }
  });


  const stats = {
    totalBooks,
    issued,
    available,
    returned,
    newBooks,
    goodBooks,
    damagedBooks,
    onHold,
    reserved,
    inArchives,
    processing,
    missing,
    restrictedAccess,
    booksThisYear,
    booksThisMonth,
    inTransit,
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
  const bookCopy = await prisma.bookCopy.findUnique({ where: { id: req.params.id } })
  if (!bookCopy) return res.status(404).send("BookCopy not found");
  res.status(200).send(bookCopy);
});



router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let library = await prisma.library.findFirst({ where: { id: req.body.libraryId } });
  if (!library) return res.status(404).send("Library not found");

  await prisma.bookCopy.create({
    data: req.body,
  });

  res.status(201).send(`${req.body.bookId} bookCopy Is Created`);
});

router.put("/archive/:id", async (req, res) => {
  const bookcopy = await prisma.bookCopy.findUnique({ where: { id: req.params.id }, });
  if (!bookcopy) {
    return res.status(404).send("BookCopy not found");
  } else if (bookcopy.status === 'INARCHIVES') {
    return res.status(404).send("BookCopy is already archived");
  }

  await prisma.bookCopy.update({
    where: { id: req.params.id },
    data: { status: 'INARCHIVES' }
  });

  res.status(200).send(`${bookcopy.code} Archived Successfully!`);
});

function validate(bookcopy) {
  const schema = Joi.object({
    bookId: Joi.string().required(),
    condition: Joi.string(),
    dateOfAcquisition: Joi.date(),
    libraryId: Joi.string().required(),
    code: Joi.string().required(),
  });

  return schema.validate(bookcopy);
}

module.exports = router;
