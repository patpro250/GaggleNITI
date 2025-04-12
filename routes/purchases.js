const Joi = require("joi");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  res.status(200).send("Testing purchases portal!");
});

module.exports = router;
