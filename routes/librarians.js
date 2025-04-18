const express = require("express");
const Joi = require("joi");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");

const prisma = require("./prismaClient");

const { Role, rolePermissions } = require("../routes/lib/librarianRoles");
const permission = require("../middleware/auth/permissions");

router.use(permission(["DIRECTOR"]));

router.get("/analytics", async (req, res) => {
  const { institutionId } = req.user.institutionId;
  const total = await prisma.librarian.count({
    where: { institutionId },
  });
  const active = await prisma.librarian.count({
    where: { institutionId, status: "ACTIVE" },
  });
  const inactive = await prisma.librarian.count({
    where: { institutionId, status: "INACTIVE" },
  });
  const suspended = await prisma.librarian.count({
    where: { institutionId, status: "SUSPENDED" },
  });
  const onLeave = await prisma.librarian.count({
    where: { institutionId, status: "ON_LEAVE" },
  });
  res.status(200).send({ total, active, inactive, suspended, onLeave });
});

router.get("/", async (req, res) => {
  const librarians = await prisma.librarian.findMany({
    where: { institutionId: req.user.institutionId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      librarianId: true,
      profile: true,
    },
  });
  res.status(200).send(librarians);
});

router.get("/pending", async (req, res) => {
  const librarians = await prisma.librarian.findMany({
    where: { institutionId: req.user.institutionId, status: "PENDING" },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      profile: true,
    },
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
    where: { id: req.body.institutionId },
  });
  if (!institution) return res.status(404).send("Institution not found!");

  let librarian = await prisma.librarian.findFirst({
    where: {
      AND: [
        { email: req.body.email },
        { institutionId: req.body.institutionId },
        { phone: req.body.phone },
      ],
    },
  });

  if (librarian)
    return res
      .status(400)
      .send(
        `Librarian with email: ${req.body.email} , phone: ${req.body.phone}  already exists!`
      );

  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);
  req.body.status = "PENDING";

  await prisma.librarian.create({ data: req.body });

  res
    .status(201)
    .send(
      `${req.body.firstName} ${req.body.lastName}, your account was created successfully, wait for you Director's approval.`
    );
});

router.post("/approve/:librarianId", async (req, res) => {
  const institutionId = req.user.institutionId;
  const { error } = validateApproval(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const isPending = await prisma.librarian.findFirst({ where: { institutionId, status: "PENDING", librarianId: req.params.librarianId } });
  if (!isPending) return res.status(404).send(`Librarian is not found or already approved!`);

  let { role } = req.body;
  req.body.permissions = rolePermissions[role];

  const approval = {
    status: "ACTIVE",
    permissions: req.body.permissions,
    libraryId: req.body.libraryId,
  };

  await prisma.librarian.update({
    where: { librarianId: req.params.librarianId },
    data: approval,
  });
  res
    .status(200)
    .send(
      `${isPending.firstName} ${isPending.lastName
      }, have been approved to join your institution, ${isPending.gender === "F" ? "she" : "he"
      } can now login to the system.`
    );
});

router.put("/reject/:librarianId", async (req, res) => {
  const librarianId = req.params.librarianId;

  const librarian = await prisma.librarian.findFirst({
    where: {
      librarianId,
      institutionId: req.user.institutionId,
      status: "PENDING",
    },
  });
  if (!librarian)
    return res
      .status(404)
      .send(`There is no such pending librarian in your institution.`);

  await prisma.librarian.update({
    where: librarianId,
    data: { status: "REJECTED" },
  });
  res
    .status(200)
    .send(
      `${librarian.firstName} ${librarian.lastName} is rejected successfully!`
    );
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let librarian = await prisma.librarian.findUnique({
    where: { librarianId: req.params.id },
  });
  if (!librarian) return res.status(404).send("Librarian not found");

  librarian = _.omit(req.body, ["password", "email", "phone"]);

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
    phone: Joi.string().min(10).max(15).required(),
    password: Joi.string().min(8).required(),
    gender: Joi.string().valid("F", "M", "O").required(),
    institutionId: Joi.string().required(),
    profile: Joi.string().uri(),
    role: Joi.string()
      .valid(
        "DIRECTOR",
        "MANAGER",
        "ASSISTANT",
        "CATALOGER",
        "REFERENCE_LIBRARIAN",
        "CIRCULATION_LIBRARIAN",
        "ARCHIVIST",
        "DIGITAL_LIBRARIAN",
        "ACQUISITIONS_LIBRARIAN",
        "YOUTH_LIBRARIAN",
        "LAW_LIBRARIAN",
        "MEDICAL_LIBRARIAN",
        "SCHOOL_LIBRARIAN",
        "PUBLIC_SERVICES_LIBRARIAN",
        "INTERLIBRARY_LOAN_LIBRARIAN",
        "RESEARCH_LIBRARIAN",
        "SERIALS_LIBRARIAN",
        "SPECIAL_COLLECTIONS_LIBRARIAN",
        "TECHNICAL_LIBRARIAN",
        "EVENTS_COORDINATOR",
        "VOLUNTEER_COORDINATOR"
      )
      .required(),
  });

  return schema.validate(librarian);
}

function validateApproval(req) {
  const schema = Joi.object({
    role: Joi.string()
      .valid(...Object.values(Role))
      .required(),
  });

  return schema.validate(req);
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
