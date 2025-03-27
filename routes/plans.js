const express = require("express");
const prisma = require("./prismaClient");
const router = express.Router();

router.get("/", async (req, res) => {
  res.status(200).send("Hey!");
});

module.exports = router;
