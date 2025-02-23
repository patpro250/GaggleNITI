const express = require("express");
const Joi = require("joi");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const _ = require("lodash");
const bcrypt = require("bcrypt");

const { Role, rolePermissions } = require("../routes/lib/librarianRoles");
const permission = require('../middleware/auth/permissions');

const prisma = new PrismaClient();

router.use(permission(['DIRECTOR']));

router.get("/dashboard", async (req, res) => {
  const totalLibrarians = await prisma.librarian.count();
  res.status(200).send({ totalLibrarians });
});

router.get("/", async (req, res) => {
  const librarians = await prisma.librarian.findMany({
    include: { institution: true },
  });
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

  let institution = await prisma.institution.findFirst({
    where: { id: req.user.institutionId },
  });
  if (!institution) return res.status(404).send("Institution not found!");

  let library = await prisma.library.findFirst({
    where: { id: req.body.libraryId, institutionId: req.user.institutionId },
  });
  if (!library)
    return res.status(404).send(`Library not found, create it first!`);

  let librarian = await prisma.librarian.findFirst({
    where: {
      AND: [
        { email: req.body.email },
        { institutionId: req.body.institutionId },
        { phoneNumber: req.body.phoneNumber },
      ],
    },
  });

  if (librarian)
    return res
      .status(400)
      .send(
        `Librarian with email: ${req.body.email} , phone: ${req.body.phoneNumber}  already exists!`
      );

  req.body.institutionId = req.user.institutionId;
  let { role } = req.body;
  req.body.permissions = rolePermissions[role];

  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  if (req.body.role === "MANAGER") {
    const librarian = await prisma.librarian.create({ data: req.body });
  
    await prisma.library.update({
      where: { id: req.body.libraryId },
      data: { managerId: librarian.librarianId },
    });
  } else {
    await prisma.librarian.create({ data: req.body });
  }
  
  res
    .status(201)
    .send(`${req.body.firstName} ${req.body.lastName} created successfully`);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let librarian = await prisma.librarian.findUnique({
    where: { librarianId: req.params.id },
  });
  if (!librarian) return res.status(404).send("Librarian not found");

  librarian = _.omit(req.body, ["password", "email", "phoneNumber"]);

  await prisma.librarian.update({
    where: { id: req.params.id },
    data: librarian,
  });
  res
    .status(200)
    .send(`${req.body.firstName} ${req.body.lastName} updated successfully`);
});

router.put("/assign/:id", async (req, res) => {
  let librarian = await prisma.librarian.findUnique({
    where: { librarianId: req.params.librarianId },
  });
  if (!librarian) return res.status(404).send(`Librarian not found!`);

  if (!req.body.libraryId)
    return res.status(400).send(`Please provide a library Id`);
  let exists = await prisma.library.findFirst({
    where: { id: req.body.libraryId, institutionId: req.user.institutionId },
  });
  if (!exists) return res.status(400).send(`Invalid Library`);

  let institution = await prisma.institution.findFirst({
    where: { id: req.user.institutionId },
  });

  await prisma.librarian.update({
    where: { librarianId: req.params.librarianId },
    data: { libraryId: req.body.libraryId },
  });
  res
    .status(200)
    .send(
      `${librarian.lastName} is assigned to ${exists.name} of ${institution.name}`
    );
});

router.put("/change-status/:id", async (req, res) => {
  const { error } = validateChangeStatus(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let librarian = await prisma.librarian.findUnique({
    where: { librarianId: req.params.id },
  });
  if (!librarian) return res.status(404).send("Librarian not found");

  librarian = await prisma.librarian.update({
    where: { librarianId: req.params.id },
    data: { status: req.body.status },
  });
  res
    .status(200)
    .send(`${librarian.lastName}'s status was changed to ${librarian.status}`);
});

function validate(librarian) {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().min(10).max(15).required(),
    password: Joi.string().min(8).required(),
    role: Joi.string()
      .valid(...Object.values(Role))
      .required(),
    gender: Joi.string().valid("F", "M", "O").required(),
    libraryId: Joi.string().required(),
  });

  return schema.validate(librarian);
}

function validateChangeStatus(req) {
  const schema = Joi.object({
    status: Joi.string()
      .valid(
        "ACTIVE",
        "INACTIVE",
        "SUSPENDED",
        "ON_LEAVE",
        "RETIRED",
        "TERMINATED",
        "PENDING",
        "PROBATION",
        "RESIGNED",
        "TRANSFERRED",
        "DECEASED"
      )
      .required(),
  });
  return schema.validate(req);
}
module.exports = router;
