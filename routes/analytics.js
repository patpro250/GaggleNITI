const express = require("express");
const router = express.Router();

const prisma = require("./prismaClient");

router.get('/', async (req, res) => {
    res.status(200).send('Testing Analytics panel');
});

module.exports = router;