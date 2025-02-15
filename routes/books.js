const express = require("express");
const languageCodes = require("./lib/languages");
const router = express.Router();
const Joi = require("joi");

const librarianAuth = require("../middleware/auth/librarian");
const permission = require("../middleware/auth/permissions");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  let { cursor, limit, q, sort, language } = req.query;
  limit = parseInt(limit) || 10;

  if (limit > 50) limit = 50;
  const orderBy = sort === 'asc' ? { createdAt: 'asc' } : { createdAt: 'desc' };

  const whereClause = {
    institutionId: req.user?.institutionId,
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { author: { contains: q, mode: "insensitive" } }
      ]
    }),
    ...(language && { language: { equals: language, mode: "insensitive" } })
  };


  const books = await prisma.book.findMany({
    where: whereClause,
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy
  });

  const nextCursor = books.length === limit ? books[books.length - 1].id : null;
  res.status(200).send({ nextCursor, books });
});

router.get("/", async (req, res) => {
  
});

router.post("/", librarianAuth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const exists = await prisma.book.findFirst({
    where: {
      AND: [
        { institutionId: req.user.institutionId },
        { edition: {  equals: req.body.edition  } }
      ]
    }
  });
  if (exists) return res.status(400).send(`'${req.body.title}' edition: '${req.body.edition}' already exists in library collection`);

  const institution = await prisma.institution.findUnique({
    where: { id: req.user.institutionId }
  });

  req.body.institutionId = req.user.institutionId

  if (!institution) return res.status(404).send("Institution not found");
  let book = await prisma.book.create({ data: req.body });

  res.status(201).send(`${book.title} is added in Library collection`);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const book = await prisma.book.findUnique({ where: { id: req.params.id } });
  if (!book) return res.status(404).send(`Book with ID: ${req.params.id} doesn't exist`);

  book = await prisma.book.update({ where: { id: req.params.id }, data: req.body });
  res.status(200).send("Book successfully updated!");
});

router.delete("/:id", async (req, res) => {
  const book = await prisma.book.findUnique({ where: { id: req.params.id } });
  if (!book) return res.status(404).send(`Book with ID: ${req.params.id} not found`);

  book = await prisma.book.delete({ where: { id: req.params.id } });
  res.status(200).send("Book deleted successfully!");
});

function validate(book) {
  const schema = Joi.object({
    title: Joi.string().required().min(3),
    author: Joi.string().required().min(3),
    publisher: Joi.string().required().min(2),
    published: Joi.date().required(),
    firstAcquisition: Joi.date().required(),
    isbn: Joi.string().min(10),
    placeOfPublication: Joi.string(),
    language: Joi.string().valid(...languageCodes).required(),
    edition: Joi.string().max(20),
    numberOfPages: Joi.number().min(5).max(10000).required(),
    shelfLocation: Joi.string().required(),
    callNo: Joi.string().min(3).max(20),
    barCode: Joi.string().max(15),
    ddcCode: Joi.string().max(15)
  });
  return schema.validate(book);
}

module.exports = router;
