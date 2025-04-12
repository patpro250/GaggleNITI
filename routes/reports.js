const express = require("express");
const router = express.Router();
const permission = require("../middleware/auth/permissions");
const prisma = require("./prismaClient");

router.use(permission(["READ"]));

router.get("/books", async (req, res) => {
  res.send("Reports...");
});

router.get("/libraries", async (req, res) => {
  res.send("Reports...");
});

router.get("/librarians", async (req, res) => {
  res.send("Reports...");
});

router.get("/students", async (req, res) => {
  res.send("Reports...");
});

router.get("/reservations", async (req, res) => {
  res.send("Reports...");
});

router.get("/members", async (req, res) => {
  res.send("Reports...");
});

module.exports = router;
