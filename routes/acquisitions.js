const express = require("express");
const Joi = require("joi");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const aquisition = await prisma.aquisition.findMany({
    include: {
      book: true,
      librarian: true,
      insititution: true,
      supplier: true,
    },
  });
  res.send(aquisition);
});

router.get("/:id", async (req, res) => {
  const aquisition = await prisma.aquisition.findUnique({
    where: { id: req.params.id },
    include: {
      book: true,
      librarian: true,
      insititution: true,
      supplier: true,
    },
  });

  if (!aquisition) return res.status(404).send("Aquisition not found!");
  res.send(aquisition);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  await prisma.aquisition.create({ data: req.body });
  res.status(201).send("Successfully created");
});

function validate(acquisition) {
  const schema = Joi.object({
    bookId: Joi.string().uuid().required(), 
    quantity: Joi.number().integer().required(),
    librarianId: Joi.string().uuid().required(),
    doneOn: Joi.date().iso().required(),
    institutionId: Joi.string().uuid().required(),
    supplierId: Joi.string().uuid().required(),
  });
  return schema.validate(acquisition);
}

module.exports = router;
