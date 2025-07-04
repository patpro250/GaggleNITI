const express = require("express");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const passwordComplexity = require("joi-password-complexity");

const _ = require("lodash");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const { complexityOptions } = require("../routes/lib/member");
const router = express.Router();

const prisma = require("./prismaClient");

const institutionSettings = require("../routes/lib/defaultSettings");
const permission = require("../middleware/auth/permissions");

router.post("/Authcode", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).send("Provide a code of institution!");
  const institution = await prisma.institution.findFirst({
    where: { code: code },
  });
  if (!institution)
    return res.status(404).send(`Institution with code: ${code} not found`);

  res.status(200).send({ code });
});
router.post("/verify", async (req, res) => {
  const { name } = req.body;

  const name__exist = await prisma.institution.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (!name__exist)
    return res.status(200).json({ message: `✅  ${name} is available` });
  res.status(404).json({ message: `${name} is not available` });
});

router.get("/", async (req, res) => {
  const institutions = await prisma.institution.findMany();
  res.status(200).send(institutions);
});

router.get("/trending", async (req, res) => {
  const trendingInstitutions = await prisma.institution.findMany({
    orderBy: { rating: "desc" },
    take: 10,
    select: {
      id: true,
      name: true,
      address: true,
      type: true,
    },
  });

  res.status(200).send(trendingInstitutions);
});

router.get("/dashboard", permission(["DIRECTOR"]), async (req, res) => {
  const data = {
    totalLibrarians: 0,
    totalStudents: 0,
    totalBooks: 0,
    totalLibraries: 0,
    totalIssuedBooks: 0,
    totalAvailableBooks: 0,
    mostBorrowedBook: "English",
    weeklyBorrowedBooks: 0,
  };
  res.send(data);
});

router.get("/is-taken", async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).send("Provide a name of institution!");
  let taken = await prisma.institution.findFirst({ where: { name: name } });
  if (taken)
    return res.status(400).send(`${name} is already taken, try another name!`);
  res.status(200).send("Okay");
});

router.get("/settings", permission(["DIRECTOR"]), async (req, res) => {
  const institution = await prisma.institution.findUnique({
    where: { id: req.user.institutionId },
  });
  if (!institution)
    return res
      .status(404)
      .send(`Institution with ID: ${req.params.id} not found`);
  res.status(200).send(institution.settings);
});

router.get("/:id", async (req, res) => {
  const institution = await prisma.institution.findFirst({
    where: { id: req.params.id },
    select: {
      name: true,
      address: true,
      phone: true,
      openingHours: true,
    },
  });
  if (!institution)
    return res
      .status(404)
      .send(`Institution with ID: ${req.params.id} not found`);
  res.status(200).send(institution);
});

router.get("/:id/settings", permission(["DIRECTOR"]), async (req, res) => {
  const institution = await prisma.institution.findUnique({
    where: { id: req.params.id },
  });
  if (!institution)
    return res
      .status(404)
      .send(`Institution with ID: ${req.params.id} not found`);
  res.status(200).send(institution.settings);
});

router.put("/:id/settings", permission(["DIRECTOR"]), async (req, res) => {
  const institution = await prisma.institution.findUnique({
    where: { id: req.params.id },
    select: { settings: true },
  });
  if (!institution)
    return res
      .status(404)
      .send(`Institution with ID: ${req.params.id} not found`);

  const currentSettings = institution?.settings || getDefaultSettings();
  const updatedSettings = _.merge(currentSettings, req.body.settings);

  await prisma.institution.update({
    where: { id: req.params.id },
    data: { settings: updatedSettings },
  });

  res.status(200).send("Settings updated successfully!");
});

router.put("/change-password", async (req, res) => {
  const { error } = validateChangePassword(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { oldPassword, newPassword } = req.body;

  const institution = await prisma.institution.findFirst({
    where: { id: req.user.institutionId },
  });
  if (!institution) return res.status(400).send(`Can't find institution!`);

  const isValid = await bcrypt.compare(oldPassword, institution.password);
  if (!isValid)
    return res
      .status(400)
      .send(
        `The old password you provided doesn't match with the one we have!`
      );

  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(newPassword, salt);
  await prisma.institution.update({
    where: { id: req.user.institutionId },
    data: { password: req.body.password },
  });

  res.status(200).send(`Password changed successfully!`);
});

router.post("/", async (req, res) => {
  if (!req.body.password) return res.status(400).send("Password is required");
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const exists = await prisma.institution.findFirst({
    where: {
      OR: [{ email: req.body.email }, { phone: req.body.phone }],
    },
  });

  const defaults = institutionSettings();
  req.body.settings = defaults.settings;
  req.body.code = await generateInstitutionCode(req.body.name);

  if (exists)
    return res
      .status(400)
      .json({ message: `${req.body.name} already exists!` });
  req.body.password = await bcrypt.hash(req.body.password, 10);
  const institution = await prisma.institution.create({
    data: req.body,
  });

  const cheapestPlan = await prisma.pricingPlan.findFirst({
    orderBy: {
      price: "asc",
    },
    take: 1,
  });

  if (!cheapestPlan) return res.status(400).send("Failed to get plan!");

  const purchase = await prisma.purchase.create({
    data: {
      institutionId: institution.id,
      planId: cheapestPlan.id,
      isTrial: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  if (!purchase) return res.status(400).send("Failed to create free trial!");

  const library = await prisma.library.create({
    data: {
      name: `Main Library`,
      institutionId: institution.id,
      shelvesNo: 10,
      type: "ACADEMIC",
    },
  });
  if (!library) return res.status(400).send("Failed to create library!");

  let payload = _.omit(institution, [
    "password",
    "settings",
    "rating",
    "openingHours",
  ]);

  payload.plan = cheapestPlan.name;
  payload.limitations = cheapestPlan.limitations;
  payload.purchaseStatus = purchase.status;
  payload.expirationDate = purchase.expiresAt;
  payload.institutionId = payload.id;
  payload.isTrial = purchase.isTrial;

  const token = jwt.sign(payload, process.env.JWT_KEY);

  res
    .status(201)
    .header("x-auth-token", token)
    .send(`${institution.name}, Welcome to Gaggle`);
});

router.put("/update", permission(["DIRECTOR"]), async (req, res) => {
  const { error } = validateUpdate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const institution = await prisma.institution.findFirst({
    where: { id: req.user.institutionId },
  });
  if (!institution)
    return res
      .status(404)
      .send(`Institution with ID: ${req.params.id} not found`);

  const checkIfTaken = await prisma.institution.findFirst({
    where: { name: req.body.name },
  });

  // if (checkIfTaken?.name !== req.body.name)
  //   return res
  //     .status(400)
  //     .send(
  //       `The updated fields are already taken by another institution, try another new name.`
  //     );

  await prisma.institution.update({
    where: { id: req.user.institutionId },
    data: req.body,
  });
  res.status(200).send(`${req.body.name} successfully updated!`);
});

router.put("/deactivate/:id", permission(["DIRECTOR"]), async (req, res) => {
  const institution = await prisma.institution.findUnique({
    where: { id: req.params.id },
  });
  if (!institution)
    return res
      .status(404)
      .send(`Institution with ID: ${req.params.id} not found`);

  await prisma.institution.update({
    where: { id: req.user.institutionId },
    data: { status: "CLOSED" },
  });
  res.status(200).send(`${institution.name} closed successfully!`);
});

router.delete("/:id", permission(["SYSTEM_ADMIN"]), async (req, res) => {
  const institution = await prisma.institution.findUnique({
    where: { id: req.params.id },
  });
  if (!institution)
    return res
      .status(404)
      .send(`Institution with ID: ${req.params.id} not found`);

  institution = await prisma.institution.delete({
    where: { id: req.params.id },
  });
  res.status(200).send("Institution deleted successfully!");
});

function validate(institution) {
  const schema = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    phone: Joi.string().required(),
    openingHours: Joi.string(),
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    status: Joi.string(),
    type: Joi.string()
      .valid(
        "UNIVERSITY",
        "COLLEGE",
        "SCHOOL",
        "PUBLIC_LIBRARY",
        "PRIVATE_LIBRARY",
        "NON_PROFIT",
        "OTHER"
      )
      .required(),
    password: passwordComplexity(complexityOptions),
  });
  return schema.validate(institution);
}

function validateUpdate(institution) {
  const schema = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    phone: Joi.string().required(),
    openingHours: Joi.string(),
  });
  return schema.validate(institution);
}

function validateChangePassword(request) {
  const schema = Joi.object({
    oldPassword: Joi.string().min(5).required(),
    newPassword: passwordComplexity(complexityOptions),
  });
  return schema.validate(request);
}

async function generateInstitutionCode(institutionName) {
  const words = institutionName.split(" ");
  const prefix =
    words.length > 1
      ? words[0][0].toUpperCase() + words[1][0].toUpperCase()
      : institutionName.slice(0, 2).toUpperCase();

  let uniqueCode = "";
  let isUnique = false;

  while (!isUnique) {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    uniqueCode = `${prefix}${randomNumber}`;

    const existing = await prisma.institution.findFirst({
      where: { code: uniqueCode },
    });

    if (!existing) isUnique = true;
  }

  return uniqueCode;
}

module.exports = router;
