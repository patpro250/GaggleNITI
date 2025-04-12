const express = require("express");
const Joi = require("joi");
const prisma = require("./prismaClient");
const router = express.Router();
const languageCodes = require("./lib/languages");

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const exists = await prisma.catalog.findFirst({
    where: {
      OR: [
        { isbn: req.body.isbn },
        { title: req.body.title, edition: req.body.edition },
      ],
    },
  });
  if (exists)
    return res
      .status(400)
      .send(`${exists.title} already exist in the catalog!`);

  const catalog = await prisma.catalog.create({ data: req.body });
  res
    .status(200)
    .send(`${catalog.title} added successfully to NitBook catalog!`);
});

router.get("/", async (req, res) => {
  let { cursor, limit, q, sort, language } = req.query;
  limit = parseInt(limit) || 10;
  if (limit > 50) limit = 50;

  const orderBy = sort === "asc" ? { createdAt: "asc" } : { createdAt: "desc" };

  const whereClause = {
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { author: { contains: q, mode: "insensitive" } },
        { keywords: { has: q } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(language && { language: { equals: language, mode: "insensitive" } }),
  };

  const catalogs = await prisma.catalog.findMany({
    where: whereClause,
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy,
  });

  const nextCursor =
    catalogs.length === limit ? catalogs[catalogs.length - 1].id : null;

  res.status(200).send({ nextCursor, catalogs });
});

router.get("/:id", async (req, res) => {
  const catalog = await prisma.catalog.findFirst({
    where: { id: req.params.id },
  });
  if (!catalog) return res.status(404).send(`This catalog is not found!`);
  res.status(200).send(catalog);
});

router.put("/:catalogId", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const catalog = await prisma.catalog.findFirst({
    where: { id: req.params.catalogId },
  });
  if (!catalog) return res.status(404).send(`This catalog is not found!`);

  await prisma.catalog.update({
    where: { id: req.params.catalogId },
    data: req.body,
  });
  res.status(200).send(`${catalog.title} updated successfully!`);
});

function validate(catalog) {
  const catalogSchema = Joi.object({
    title: Joi.string().min(1).required(),
    author: Joi.string().min(1).required(),
    isbn: Joi.string().min(10).max(17).required(),
    published: Joi.date().iso().required(),
    publisher: Joi.string().min(1).required(),
    category: Joi.string().min(1).required(),
    language: Joi.string()
      .valid(...languageCodes)
      .required(),
    description: Joi.string().min(1).required(),
    ddcCode: Joi.string().min(1).required(),
    placeOfPublication: Joi.string().allow(null, "").optional(),
    lccCode: Joi.string().min(1).required(),
    callNo: Joi.string().min(1).required(),
    keywords: Joi.array().items(Joi.string().min(1)).required(),
    format: Joi.string().valid("AUDIO", "EBOOK", "HARD_COVER").required(),
    edition: Joi.string().allow(null, "").optional(),
    pages: Joi.number().integer().positive(),
    coverImageURL: Joi.string().uri(),
  });

  return catalogSchema.validate(catalog);
}

module.exports = router;
