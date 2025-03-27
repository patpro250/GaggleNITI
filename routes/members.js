const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const { validate, validatePassword } = require("../routes/lib/member");

const isMember = require("../middleware/auth/member");
const permission = require("../middleware/auth/permissions");

const prisma = require("./prismaClient");

router.get("/", async (req, res) => {
  let members = await prisma.member.findMany();
  members = members.map((member) => _.omit(member, ["password"]));
  res.status(200).send(members);
});

router.get("/:id", async (req, res) => {
  let member = await prisma.member.findUnique({ where: { id: req.params.id } });
  if (!member) return res.status(404).send("Member not found");
  member = _.omit(member, ["password"]);
  res.status(200).send(member);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let member = await prisma.member.findUnique({
    where: { email: req.body.email },
  });
  if (member)
    return res
      .status(400)
      .send(`Member with email: ${req.body.email} already exists!`);

  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  await prisma.member.create({ data: req.body });
  res
    .status(201)
    .send(`${req.body.firstName} ${req.body.lastName} created successfully`);
});

router.post("/change-password/:id", isMember, async (req, res) => {
  const { error } = validatePassword(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let member = await prisma.member.findUnique({ where: { id: req.params.id } });
  if (!member) return res.status(404).send("Member not found!");

  const isSame = await bcrypt.compare(req.body.oldPassword, member.password);
  if (!isSame) return res.status(400).send("Passwords doesn't match!");

  const salt = await bcrypt.genSalt(10);
  req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);
  await prisma.member.update({
    where: { id: req.params.id },
    data: {
      password: req.body.newPassword,
    },
  });

  res.status(200).send("Password Changed successfully!");
});

router.put("/:id", isMember, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let member = await prisma.member.findUnique({ where: { id: req.params.id } });
  if (!member) return res.status(404).send("Member not found");

  member = _.omit(req.body, ["password", "email", "phone"]);

  await prisma.member.update({ where: { id: req.params.id }, data: member });
  res
    .status(200)
    .send(`${req.body.firstName} ${req.body.lastName} updated successfully`);
});

module.exports = router;
