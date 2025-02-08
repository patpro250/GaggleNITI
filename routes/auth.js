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
    const { error } = validateMember(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let member = await prisma.member.findFirst({where: {email: req.body.email}});
    if (!member) return res.status(400).send('Invalid email or password');

    const isValid = await bcrypt.compare(req.body.password, member.password);
    if (!isValid) return res.status(400).send('Invalid email or password');

    const token = jwt.sign({id: member.id}, process.env.JWT_KEY);
    res.status(200).send(token);
});

function validateMember(req) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });
    return schema.validate(req)
}

module.exports = router;