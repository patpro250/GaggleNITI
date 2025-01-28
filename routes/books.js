const express = require("express");
const languageCodes = require("./lib/languages");
const router = express.Router();
const Joi = require("joi");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const books = await prisma.book.findMany();
  res.status(200).send(books);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const exists = await prisma.book.findFirst({where: {title: req.body.title}});
  if (exists) return res.status(400).send(`'${req.body.title}' already exists`);

  const institution = await prisma.institution.findUnique({where: {
    id: req.body.institutionId
  }});

  if (!institution) return res.status(404).send("Institution not found");
  await prisma.book.create({data: req.body});

  res.status(201).send("New book is created");
});

router.put("/:id", async (req, res) => {
  const {error} = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const book = await prisma.book.findUnique({where: {id: req.params.id}});
  if (!book) return res.status(404).send(`Book with ID: ${req.params.id} doen't exist`);

  book = await prisma.book.update({where: {id: req.params.id}, data: req.body});
  res.status(200).send("Book successfully updated!");
});

router.delete("/:id", async (req, res) => {
    const book = await prisma.book.findUnique({where: {id: req.params.id}});
    if (!book) return res.status(404).send(`Book with ID: ${req.params.id} not found`);

    book = await prisma.book.delete({where: {id: req.params.id}});
    res.status(200).send("Book deleted successfully!");
});

function validate(book) {
  const schema = Joi.object({
    title: Joi.string().required().min(3),
    author: Joi.string().required().min(3),
    publisher: Joi.string().required().min(2),
    published: Joi.date().required(),
    firstAquisition: Joi.date().required(),
    isbn: Joi.string().min(10),
    placeOfPublication: Joi.string(),
    language: Joi.string().valid(...languageCodes).required(),
    edition: Joi.string().max(20),
    numberOfPages: Joi.number().min(5).max(10000).required(),
    shelfLocation: Joi.string().required(),
    callNo: Joi.string().min(3).max(20),
    barCode: Joi.string().max(15),
    ddcCode: Joi.string().max(15),
    institutionId: Joi.string().required(),
  });
  return schema.validate(book);
}

module.exports = router;
