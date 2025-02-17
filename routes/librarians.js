const express = require("express");
const Joi = require("joi");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const _ = require("lodash");
const bcrypt = require("bcrypt");

const {Role, rolePermissions} = require("../routes/lib/librarianRoles");

const prisma = new PrismaClient();

router.get('/dashboard', async (req, res) => {
  const totalLibrarians = await prisma.librarian.count();
  res.status(200).send({totalLibrarians});
});
router.get("/", async (req, res) => {
  const librarians = await prisma.librarian.findMany({ include: { institution: true },});
  res.status(200).send(librarians);
});

router.get("/:id", async (req, res) => {
  const librarian = await prisma.librarian.findUnique({
    where: { librarianId: req.params.id },
    include: { institution: true },
    
  });
  if (!librarian) return res.status(404).send("Librarian not found!");
  res.status(200).send(librarian);
});

router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let institution = await prisma.institution.findFirst({where: {id: req.body.institutionId}});
    if (!institution) return res.status(404).send('Institution not found!');

    let librarian = await prisma.librarian.findFirst({
      where: {
        AND: [
          { email: req.body.email },
          { institutionId: req.body.institutionId },
          { phoneNumber: req.body.phoneNumber }
        ]
      }
      });

     if (librarian) return res.status(400).send(`Librarian with email: ${req.body.email} , phone: ${req.body.phoneNumber}  already exists!`);

    librarian = req.body;
    let { role } = librarian;
    librarian.permissions = rolePermissions[role];

    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    await prisma.librarian.create({data: librarian});
    res.status(201).send(`${librarian.firstName} ${librarian.lastName} created successfully`);
});

router.put("/:id", async(req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let librarian = await prisma.librarian.findUnique({where: {librarianId: req.params.id}});
    if (!librarian) return res.status(404).send("Librarian not found");

    librarian = _.omit(req.body, ["password", "email", "phoneNumber"]);

    await prisma.librarian.update({where: {id: req.params.id}, data: librarian});
    res.status(200).send(`${req.body.firstName} ${req.body.lastName} updated successfully`);
});

router.put('/change-status/:id', async (req, res) => {
  const { error } = validateChangeStatus(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let librarian = await prisma.librarian.findUnique({where: {librarianId: req.params.id}});
  if (!librarian) return res.status(404).send("Librarian not found");

  librarian = await prisma.librarian.update({where: {librarianId: req.params.id}, data: {status: req.body.status}});
  res.status(200).send(`${librarian.lastName}'s status was changed to ${librarian.status}`);
});

function validate(librarian){
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().min(10).max(15).required(),
    password: Joi.string().min(8).required(),
    institutionId: Joi.string().uuid().required(),
    role: Joi.string().valid(...Object.values(Role)).required(),
    gender: Joi.string().valid('F', 'M', 'O').required()
  });

  return schema.validate(librarian);
}

function validateChangeStatus(req) {
  const schema = Joi.object({
    status: Joi.string().valid(
      'ACTIVE',
      'INACTIVE',
      'SUSPENDED',
      'ON_LEAVE',
      'RETIRED',
      'TERMINATED',
      'PENDING',
      'PROBATION',
      'RESIGNED',
      'TRANSFERRED',
      'DECEASED'
    ).required()
  })
  return schema.validate(req);
}
module.exports = router;
