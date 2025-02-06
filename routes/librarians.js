const express = require("express");
const Joi = require("joi");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const _ = require("lodash");
const bcrypt = require("bcrypt");

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

    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    await prisma.librarian.create({data: req.body});
    res.status(201).send("Librarian created successfully");
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

function validate(librarian){
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().min(10).max(15).required(),
    password: Joi.string().min(8).required(),
    institutionId: Joi.string().uuid().required(),
  });

  return schema.validate(librarian);
}
module.exports = router;
