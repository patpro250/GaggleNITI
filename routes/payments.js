const express = require("express");
const permission = require("../middleware/auth/permissions");
const prisma = require("./prismaClient");
const router = express.Router();
const Joi = require("joi");

router.get("/", async (req, res) => {
  const institution = req.user.institutionId;
  if (!institution) return res.status(400).send(`Institution not found!`);

  const { status } = req.query;

  if (status && !['PENDING', 'SUCCESS', 'FAILED'].includes(status.toUpperCase())) {
    status = 'PENDING';
  }

  const payments = await prisma.payment.findMany({
    where: {
      institutionId: institution,
      ...(status && { status: status.toUpperCase() })
    },
  });

  res.status(200).send(payments);
});

router.get("/all", permission(["SYSTEM_ADMIN"]), async (req, res) => {
  const payments = await prisma.payment.findMany({});
  res.status(200).send(payments);
});

router.post('/momo', async (req, res) => {
  const { institutionId } = req.user;
  const { error } = validatePaymentRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const plan = await prisma.pricingPlan.findFirst({ where: { id: req.body.planId } });
  if (!plan || amount < plan.price) {
    return res.status(400).send("Invalid amount or plan.");
  }

  await prisma.payment.create({
    data: {
      institutionId,
      planId: req.body.planId,
      amount: req.body.amount,
      currency: 'RWF',
      status: 'PENDING',
      method: 'MOBILE_MONEY',
    }
  });

  res.status(200).send('Payment submitted. Awaiting confirmation.');

});

router.patch('/approve/:paymentId', permission(["SYSTEM_ADMIN"]), async (req, res) => {
  const paymentId = req.params.paymentId;

  const payment = await prisma.payment.findFirst({ where: { id: paymentId, status: { not: 'PENDING' } } });
  if (!payment) return res.status(404).send(`Payment not found or already confirmed!`);

  const paymentCode = generateConfirmationCode(institution.name);
  await prisma.payment.update({ where: { id: paymentId }, data: { status: 'APPROVED', confirmationCode: paymentCode, phoneNumber: req.body.paymentCode } });

  res.status(200).send(`You have approved a payment with code ${paymentCode}`);
});

router.patch('/confirm', permission(["SYSTEM_ADMIN"]), async (req, res) => {
  const { error } = validatePaymentConfirmation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const payment = await prisma.payment.findFirst({
    where: { confirmationCode: req.body.code, status: "APPROVED" },
  });
  if (!payment)
    return res.status(404).send(`Payment not found!`);

  const now = new Date();
  var expiresAt;

  const activePurchase = await prisma.purchase.findFirst({
    where: {
      institutionId: payment.institutionId,
      expiresAt: { gte: now },
    },
  });

  if (activePurchase) {
    const timeLeft = activePurchase.expiresAt - now;
    const newExpiryDate = new Date(
      now.getTime() + timeLeft + 30 * 24 * 60 * 60 * 1000
    );
    expiresAt = newExpiryDate;
  } else {
    expiresAt = now + 30 * 24 * 60 * 60 * 1000;
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: "SUCCESS" },
    }),
    prisma.purchase.create({
      data: {
        institutionId: payment.institutionId,
        planId: payment.planId,
        amount: payment.amount,
        currency: payment.currency,
        expiresAt,
      },
    }),
  ]);

  res.status(200).send(`You have confirmed the payment, you can now login!`)
});



function validatePaymentRequest(request) {
  const schema = Joi.object({
    amount: Joi.number().required(),
    phoneNumber: Joi.string().required(),
    planId: Joi.string().uuid().required()
  });
  return schema.validate(request);
}

function validatePaymentConfirmation(request) {
  const schema = Joi.object({
    code: Joi.string().required()
  });
  return schema.validate(request);
}

function generateConfirmationCode(institutionName) {
  const cleaned = institutionName.trim().replace(/\s+/g, '');

  if (cleaned.length < 2) {
    throw new Error("Institution name must be at least 2 characters long.");
  }

  const first = cleaned.charAt(0).toUpperCase();
  const last = cleaned.charAt(cleaned.length - 1).toUpperCase();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);

  return `${first}${last}${randomDigits}`;
}

module.exports = router;
