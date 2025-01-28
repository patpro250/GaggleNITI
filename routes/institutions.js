const express = require("express");
const Joi = require("joi");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const institutions = await prisma.institution.findMany();
  res.status(200).send(institutions);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const exists = await prisma.institution.findFirst({
    where: {
      OR: [
        { email: req.body.email },
        { phone: req.body.phone },
        { name: req.body.name },
      ],
    },
  });

  if (exists) return res.status(400).send(`${req.body.name} already exists!`);
   const institution = await prisma.institution.create({
    data: req.body,
  });

  res.status(201).send(institution);
});

router.put("/:id", async(req, res) => {
  const {error} = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const institution = await prisma.institution.findUnique({where: {id: req.params.id}});
  if (!institution) return res.status(404).send(`Institution with ID: ${req.params.id} not found`);

  institution = await prisma.institution.update({ where: { id: req.params.id }, data: req.body });
  res.status(200).send(`${req.body.name} successfully updated!`);
});

router.delete("/:id", async (req, res) => {
  const institution = await prisma.institution.findUnique({ where: { id: req.params.id } });
  if (!institution) return res.status(404).send(`Institution with ID: ${req.params.id} not found`);

  institution = await prisma.institution.delete({ where: { id: req.params.id } });
  res.status(200).send("Institution deleted successfully!");
})

function validate(institution) {
  const schema = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    phone: Joi.string().required(),
    openingHours: Joi.string(),
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    managerId: Joi.string(),
    status: Joi.string(),
    established: Joi.date(),
    rating: Joi.number(),
    institutionTypeId: Joi.string(),
    manager: Joi.string(),
  });
  return schema.validate(institution);
}

module.exports = router;
