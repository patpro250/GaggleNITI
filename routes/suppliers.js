const express = require("express");
const router = express.Router();
const Joi = require("joi");
const _ = require("lodash");

const prisma = require("./prismaClient");

router.get("/", async (req, res) => {
  const suppliers = await prisma.supplier.findMany();
  res.status(200).send(suppliers);
});

router.get("/:id", async (req, res) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id: req.params.id },
  });
  if (!supplier) return res.status(404).send(`Supplier not found!`);
  res.status(200).send(supplier);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let supplier = await prisma.supplier.findUnique({
    where: { email: req.body.email },
  });
  if (supplier)
    return res
      .status(400)
      .send(`Supplier with email: ${req.body.email} already exists!`);

  await prisma.supplier.create({ data: req.body });
  res.send(`${req.body.name} inserted successfully`);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let supplier = await prisma.supplier.findUnique({
    where: { id: req.params.id },
  });
  if (!supplier) return res.status(404).send("Supplier not found");

  member = _.omit(req.body, ["email", "phone"]);
  await prisma.supplier.update({ where: { id: req.params.id }, data: member });
  res.status(200).send(`${req.body.name} updated successfully`);
});

router.delete("/:id", async (req, res) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id: req.params.id },
  });

  if (!supplier) return res.status(404).send("Supplier not found");

  await prisma.supplier.delete({ where: { id: req.params.id } });
  res.send(`Supplier with ID ${supplier.id} deleted successfully`);
});
function validate(supplier) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).required(),
    website: Joi.string()
      .uri()
      .optional()
      .custom((value) => value.toLowerCase()),
    address: Joi.object().required(),
  });

  return schema.validate(supplier);
}

module.exports = router;
