const Joi = require("joi");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  res.status(200).send("Testing payments portal!");
});

module.exports = router;
