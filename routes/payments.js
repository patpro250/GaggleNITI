const Joi = require("joi");
const express = require("express");
const permission = require("../middleware/auth/permissions");
const router = express.Router();

router.get("/", async (req, res) => {
  res.status(200).send("Testing payments portal!");
});

router.get("/saved", permission(["DIRECTOR"]), async (req, res) => {
  res.status(200).send("Saved payment method!");
});

router.get("/billing", permission(["DIRECTOR"]), async (req, res) => {
  res.status(200).send("Billing information!");
});

module.exports = router;
