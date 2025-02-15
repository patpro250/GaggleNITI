const express = require("express");
const Joi = require("joi");
const _ = require("lodash");
const router = express.Router();
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.post('/members', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let member = await prisma.member.findFirst({where: {email: req.body.email}});
    if (!member) return res.status(400).send('Invalid email or password');

    const isValid = await bcrypt.compare(req.body.password, member.password);
    if (!isValid) return res.status(400).send('Invalid email or password');

    let payload = _.pick(member, ["id", "email", "firstName", "lastName"]);

    const token = jwt.sign(payload, process.env.JWT_KEY);
    res.status(200).header('x-auth-token', token).send(`Welcome back ${member.lastName}!`);
});

router.post('/librarians', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let librarian = await prisma.librarian.findFirst({where: {email: req.body.email}});
    if (!librarian) return res.status(400).send('Invalid email or password');

    const isValid = await bcrypt.compare(req.body.password, librarian.password);
    if (!isValid) return res.status(400).send('Invalid email or password');

    let payload = _.omit(librarian, ["password"]);
    const token = jwt.sign(payload, process.env.JWT_KEY);

    res.status(200).header('x-auth-token', token).send(`Welcome back ${librarian.lastName}`);
});

router.post("/director", async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let institution = await prisma.institution.findFirst({where: {email: req.body.email}});
    if (!institution) return res.status(400).send('Invalid email or password');

    const isValid = await bcrypt.compare(req.body.password, institution.password);
    if (!isValid) return res.status(400).send('Invalid email or password');

    let payload = _.omit(institution, ['password']);
    const token = jwt.sign(payload, process.env.JWT_KEY);

    res.status(200).header('x-auth-token', token).send(`Welcome back ${institution.name}!`);
});

function validate(req) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });
    return schema.validate(req)
}

module.exports = router;