const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { PrismaClient } = require("@prisma/client");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const validate = require("../routes/lib/member");

const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const users = await prisma.member.findMany();
  res.status(200).send(users);
});

router.get("/:id", async (req, res) => {
    const member = await prisma.member.findUnique({where: {id: req.params.id}});
    if (!member) return res.status(404).send("Member not found");
    res.status(200).send(member);
});

router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let member = await prisma.member.findUnique({where: {email: req.body.email}});
    if (member) return res.status(400).send(`Member with email: ${req.body.email} already exists!`);

    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    await prisma.member.create({data: req.body});
    res.status(201).send("Member created successfully");
});

router.put("/:id", async(req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let member = await prisma.member.findUnique({where: {id: req.params.id}});
    if (!member) return res.status(404).send("Member not found");

    member = _.omit(req.body, ["password", "email", "phone"]);

    await prisma.member.update({where: {id: req.params.id}, data: member});
    res.status(200).send(`${req.body.firstName} ${req.body.lastName} updated successfully`);
});


module.exports = router;
