const Joi = require("joi");
const express = require("express");
const prisma = require("./prismaClient");
const router = express.Router();

router.get("/current", async (req, res) => {
  const institutionId = req.user.institutionId;
  if (!institutionId) return res.status(400).send(`Institution not found!`);

  const currentPlan = await prisma.purchase.findFirst({
    where: { institutionId, expiresAt: { gte: new Date() } },
    include: {
      PricingPlan: true,
      Payment: true
    }
  });
  if (!currentPlan) return res.status(400).send(`No current plan found!`);
  return res.status(200).send(currentPlan);
});

router.post('/verify', async (req, res) => {
  const institution = req.user.institutionId;
  if (!institution) return res.status(400).send(`Institution not found!`);

  const { error } = validatePaymentCode(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const isValid = await prisma.payment.findFirst({where: {confirmationCode: req.body.confirmationCode}});
  if (!isValid) return res.status(400).send('The code you provided is not valid!');

  res.status(200).send(`You can now login to continue using the app.`)
});

function validatePaymentCode(code) {
  const schema = Joi.object({
    confirmationCode: Joi.string()
      .pattern(/^[A-Z]{2}[0-9]{4}$/)
      .required()
      .messages({
        'string.pattern.base': 'Code must be 2 uppercase letters followed by 4 digits (e.g., SL1234).',
        'string.empty': 'Confirmation code is required.',
        'any.required': 'Confirmation code is required.'
      })
  });
  return schema.validate(code);
}

module.exports = router;
