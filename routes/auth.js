const express = require("express");
const Joi = require("joi");
const _ = require("lodash");
const router = express.Router();
const bcrypt = require("bcrypt");
const IsUser = require("../middleware/auth/user");
const { loginLimiter } = require("../middleware/limiter");

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const prisma = require("./prismaClient");

router.get("/members/me", IsUser, async (req, res) => {
  const member = await prisma.member.findUnique({ where: { id: req.user.id } });
  if (!member) return res.status(404).send(`User not found`);
  res.status(200).send(member);
});

router.get("/librarians/me", IsUser, async (req, res) => {
  let librarian = await prisma.librarian.findUnique({
    where: { librarianId: req.user.librarianId },
  });
  librarian = _.omit(librarian, ["password"]);
  if (!librarian) return res.status(404).send(`Librarian not found`);
  res.status(200).send(librarian);
});

router.use(loginLimiter);

router.post("/members", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let member = await prisma.member.findFirst({
    where: { email: req.body.email },
  });
  if (!member) return res.status(400).send("Invalid email or password");

  const isValid = await bcrypt.compare(req.body.password, member.password);
  if (!isValid) return res.status(400).send("Invalid email or password");

  let payload = _.pick(member, ["id", "email", "firstName", "lastName"]);

  const token = jwt.sign(payload, process.env.JWT_KEY);
  res
    .status(200)
    .header("x-auth-token", token)
    .send(payload);
});

router.post("/librarians", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let librarian = await prisma.librarian.findFirst({
    where: { email: req.body.email },
  });
  if (!librarian) return res.status(400).send("Invalid email or password");

  if (librarian.status !== "ACTIVE")
    return res.status(400).send(`Your account is ${librarian.status}!`);

  const activePurchase = await prisma.purchase.findFirst({ where: { institutionId: librarian.institutionId, status: 'ACTIVE' } });
  if (!activePurchase) return res.status(400).send("Your institution has no active subscription!");

  const plan = await prisma.pricingPlan.findFirst({ where: { id: activePurchase.planId } });
  if (!plan) return res.status(400).send("Failed to get plan!");

  const library = await prisma.library.findFirst({ where: { institutionId: librarian.institutionId } });
  if (!library) res.status(400).send(`Can't find library`);

  const isValid = await bcrypt.compare(req.body.password, librarian.password);
  if (!isValid) return res.status(400).send("Invalid email or password");

  const payload = _.omit(librarian, ["password"]);

  payload.plan = plan.name;
  payload.limitations = plan.limitations;
  payload.purchaseStatus = activePurchase.status;
  payload.expirationDate = activePurchase.expiresAt;
  payload.libraryId = library.id;

  const token = jwt.sign(payload, process.env.JWT_KEY);

  res
    .header('x-auth-token', token)
    .status(200)
    .send(payload);
});

router.post("/director", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let institution = await prisma.institution.findFirst({
    where: { email: req.body.email },
  });
  if (!institution) return res.status(400).send("Invalid email or password");

  const activePurchase = await prisma.purchase.findFirst({ where: { institutionId: institution.id, status: 'ACTIVE' } });
  if (!activePurchase) return res.status(400).send("Your institution has no active subscription!");

  const plan = await prisma.pricingPlan.findFirst({ where: { id: activePurchase.planId } });
  if (!plan) return res.status(400).send("Failed to get plan!");

  const isValid = await bcrypt.compare(req.body.password, institution.password);
  if (!isValid) return res.status(400).send("Invalid email or password");

  let payload = _.omit(institution, ["password", "settings"]);

  payload.plan = plan.name;
  payload.limitations = plan.limitations;
  payload.purchaseStatus = activePurchase.status;
  payload.expirationDate = activePurchase.expiresAt;

  payload.institutionId = payload.id;
  const token = jwt.sign(payload, process.env.JWT_KEY);

  res
    .status(200)
    .header("x-auth-token", token)
    .send(payload);
});

router.post('/admin', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const admin = await prisma.systemAdmin.findFirst({ where: { email: req.body.email } });
  if (!admin) return res.status(400).send("Invalid email or password");

  const isValid = await bcrypt.compare(req.body.password, admin.password);
  if (!isValid) return res.status(400).send("Invalid email or password");

  const payload = _.pick(admin, ["email", "phone", "firstName", "lastName"]);
  payload.permissions = ['SYSTEM_ADMIN'];
  const token = jwt.sign(payload, process.env.JWT_KEY);

  res.status(200).header("x-auth-token", token).send(payload);
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(req);
}

module.exports = router;
