const express = require("express");
const prisma = require("./prismaClient");
const permission = require("../middleware/auth/permissions");
const router = express.Router();

router.get("/", async (req, res) => {
  res.status(200).send("Hey!");
});

router.get("/current", permission(["DIRECTOR"]), async (req, res) => {
  res.status(200).send("Current plan");
});

module.exports = router;
