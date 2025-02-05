const express = require("express");
const Joi = require("joi");
const now = require("../routes/lib/now");
const _ = require("lodash");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();

const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    const interLibrary = await prisma.interLibrary.findMany();
    res.status(200).send(interLibrary);
});

module.exports = router;