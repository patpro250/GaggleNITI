const express = require("express");
const Joi = require("joi");
const router = express.Router();

const prisma = require("./prismaClient");

const permission = require("../middleware/auth/permissions");

router.get("/", async (req, res) => {
  let { cursor, limit, q, sort } = req.query;
  limit = parseInt(limit) || 10;

  if (limit > 50) limit = 50;
  const orderBy = sort === "asc" ? { createdAt: "asc" } : { createdAt: "desc" };

  const where = {
    ...(q && {
      OR: [{ name: { contains: q, mode: "insensitive" } }],
    }),
  };

  const libraries = await prisma.library.findMany({
    where,
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy,
    include: {
      librarian: true,
    },
  });

  const nextCursor =
    libraries.length === limit ? libraries[libraries.length - 1].id : null;
  res.status(200).send({ nextCursor, libraries });
});

router.get("/:id", async (req, res) => {
  let library = await prisma.library.findUnique({
    where: { id: req.params.id },
    include: { librarian: true },
  });
  if (!library) return res.status(404).send(`This library is not found`);
  res.status(200).send(library);
});

router.use(permission(["DIRECTOR"]));

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let exists = await prisma.library.findFirst({
    where: {
      AND: [{ name: req.body.name }, { institutionId: req.user.institutionId }],
    },
  });
  if (exists)
    return res.status(400).send(`${exists.name} already exists, try again!`);

  exists = await prisma.institution.findFirst({
    where: { id: req.user.institutionId },
  });

  req.body.institutionId = req.user.institutionId;
  await prisma.library.create({
    data: {
      name: req.body.name,
      shelvesNo: req.body.shelvesNo,
      type: req.body.type,
      institution: {
        connect: {
          id: req.user.institutionId,
        },
      },
    },
  });

  res.status(200).send(`${req.body.name} added successfully to ${exists.name}`);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const library = await prisma.library.findUnique({
    where: { id: req.params.id },
  });
  if (!library)
    return res
      .status(404)
      .send(`Library with ID: ${req.params.id} doesn't exist`);

  await prisma.library.update({ where: { id: req.params.id }, data: req.body });
  res.status(200).send(`${req.body.name} updated successfully!`);
});

router.put("/deactivate/:id", async (req, res) => {
  let library = await prisma.library.findUnique({
    where: { id: req.params.id },
    include: { librarian: true },
  });
  if (!library) return res.status(404).send(`This library is not found`);
  await prisma.library.update({
    where: { id: req.params.id },
    data: { status: "CLOSED" },
  });
  res.status(200).send(`${library.name} is deactivated successfully!`);
});

function validate(library) {
  let schema = Joi.object({
    name: Joi.string().required().min(3).max(50),
    directorId: Joi.string().uuid(),
    shelvesNo: Joi.number().required(),
    type: Joi.string().required(),
  });
  return schema.validate(library);
}

module.exports = router;
