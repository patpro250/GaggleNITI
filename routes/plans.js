const express = require("express");
const prisma = require("./prismaClient");
const permission = require("../middleware/auth/permissions");
const router = express.Router();
const Joi = require("joi");

router.get("/", async (req, res) => {
  const plans = await prisma.pricingPlan.findMany({ where: { status: { not: 'INACTIVE' } } });
  res.status(200).send(plans);
});

router.get("/:id", async (req, res) => {
  const planId = req.params.id;
  const plan = await prisma.pricingPlan.findFirst({where: {id: planId}});
  
  if (!plan) return res.status(404).send(`Plan not found!`);
  res.status(200).send(plan);
});

router.post('/', permission(['SYSTEM_ADMIN']), async (req, res) => {
  const { error } = validatePlan(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const exists = await prisma.pricingPlan.findFirst({
    where: {
      name: req.body.name,
    }
  });
  if (exists) return res.status(400).send(`${exists.name} plan already exists`);

  await prisma.pricingPlan.create({ data: req.body });
  res.status(201).send(`${req.body.name} plan is created`);
});

router.put('/:planId', permission(['SYSTEM_ADMIN']), async (req, res) => {
  const { error } = validatePlan(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const plan = await prisma.pricingPlan.findFirst({ where: { id: req.params.planId } });
  if (!plan) return res.status(404).send(`This plan doesn't exist`);

  await prisma.pricingPlan.update({
    where: { id: req.params.planId },
    data: req.body
  });
  res.status(200).send(`${plan.name} plan is updated`);
});

router.patch('/discount/:planId', permission(['SYSTEM_ADMIN']), async (req, res) => {
  const { error } = validateDiscount(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const plan = await prisma.pricingPlan.findFirst({ where: { id: req.params.planId } });
  if (!plan) return res.status(404).send(`This plan doesn't exist`);

  await prisma.pricingPlan.update({
    where: { id: req.params.planId },
    data: { discount: req.body.discount }
  });
  res.status(200).send(`Discount of ${req.body.discount} is applied to ${plan.name} plan`);
});

router.patch('/de-activate/:planId', permission(['SYSTEM_ADMIN']), async (req, res) => {
  const plan = await prisma.pricingPlan.findFirst({ where: { id: req.params.planId } });
  if (!plan) return res.status(404).send(`This plan doesn't exist`);

  await prisma.pricingPlan.update({
    where: { id: req.params.planId },
    data: { status: 'INACTIVE' }
  });
  res.status(200).send(`${plan.name} plan is deactivated`);
});

function validatePlan(plan) {
  const schema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().precision(2).required(),
    duration: Joi.number().integer().min(1).required(),
    features: Joi.string().required(),
    discount: Joi.number().precision(2).max(0.9).min(0).optional(),
    tokens: Joi.number().min(5).required(),
    limitations: Joi.object().required(),
    status: Joi.string().valid(['ACTIVE', "INACTIVE", "COMMING_SOON"]).required()
  });
  return schema.validate(plan);
}

function validateDiscount(discount) {
  const schema = Joi.object({
    discount: Joi.number().precision(2).min(0).max(0.9).required(),
  });
  return schema.validate(discount);
}

module.exports = router;
