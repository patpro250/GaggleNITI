const express = require("express");
const router = express.Router();
const Joi = require("joi");
const _ = require("lodash");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const suppliers = await prisma.supplier.findMany();
  if (!suppliers) return res.status(500).send("Internal Server error");
  res.send(suppliers);
});

router.get("/:id", async (req, res) => {
  const oneSupplier = await prisma.supplier.findUnique({
    where: { id: req.params.id },
    include:{
      
    }
  });

  if (!oneSupplier)
    return res.status(404).send(`Supplier ${req.params.id} not found`);

  res.send(oneSupplier);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const existingSupplier = await prisma.supplier.findUnique({
    where: { email: req.body.email },
  });

  if (existingSupplier)
    return res.status(400).send(`${req.body.email} already exists`);

  const suppliers = await prisma.supplier.create({
    data: req.body,
  });

  if (!suppliers) return res.status(500).send("Internal Server error");

  res.send(`Supplier ${suppliers.email} inserted success`);
});

router.delete("/:id", async (req, res) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id: req.params.id },
  });

  if (!supplier) return res.status(404).send("Supplier not found");

  const supplierdelet = prisma.supplier.delete({
    where: { id: req.params.id },
  });

  res.send(`Supplier ${supplier.id} deleted successfully`);
});

router.put("/:id", async (req, res) => {

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let supplier = await prisma.supplier.findUnique({
    where: { id: req.params.id },
  });

  supplier = _.omit(req.body, ["email", "phone"]);

  if (!supplier)
    return res.status(404).send(`Supplier ${supplier.id} Not Found`);

  const updatedsupplier = await prisma.supplier.update({
    where: { id: req.params.id },
    data: supplier,
  });

  res
    .status(200)
    .send(`Supplier ${updatedsupplier.email} updated successfully`);
});
function validate(supplier) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().lowercase().required(),
    phone: Joi.string().min(10).required(),
     website: Joi.string().uri().optional().custom((value) => value.toLowerCase()),
    address: Joi.object().required(),
    status: Joi.optional(),
    aquisition: Joi.optional(),
  });

  return schema.validate(supplier);
}

module.exports = router;
