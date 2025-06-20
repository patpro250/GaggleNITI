const express = require("express");
const permission = require("../middleware/auth/permissions");
const prisma = require("./prismaClient");
const router = express.Router();
const Joi = require("joi");

const directorsOnly = require("../middleware/auth/director");

router.get("/", async (req, res) => {
  const institution = req.user.institutionId;
  if (!institution) return res.status(400).send(`Institution not found!`);

  let { status } = req.query;

  if (
    status &&
    !["PENDING", "SUCCESS", "FAILED"].includes(status.toUpperCase())
  ) {
    status = "PENDING";
  }

  const payments = await prisma.payment.findMany({
    where: {
      institutionId: institution,
      ...(status && { status: status.toUpperCase() }),
    },
  });

  res.status(200).send(payments);
});

router.get("/all", permission(["SYSTEM_ADMIN"]), async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        status: {
          in: ["PENDING"],
        },
      },
      include: {
        institution: {
          select: {
            name: true,
          },
        },
        PricingPlan: {
          select: {
            name: true,
          },
        },
      },
    });

    res.status(200).send(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res
      .status(500)
      .send({ error: "Something went wrong while fetching payments" });
  }
});

router.get("/approved", permission(["SYSTEM_ADMIN"]), async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { status: "APPROVED" },
      include: {
        PricingPlan: {
          select: { name: true },
        },
      },
    });

    res.status(200).send(payments);
  } catch (error) {
    console.error("Error fetching approved payments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/pending", permission(["SYSTEM_ADMIN"]), async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: { status: "PENDING" },
    include: {
      PricingPlan: {
        select: { name: true },
      },
    },
  });

  const formatted = payments.map((p) => {
    return {
      doneOn: p.doneAt.toLocaleString(),
      plan: p.PricingPlan.name,
      phone: p.phoneNumber,
      status: p.status,
    };
  });
  res.status(200).send(formatted);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  const singlepayment = await prisma.payment.findFirst({
    where: { id },
    include: {
      institution: {
        select: { name: true },
      },
      PricingPlan: {
        select: { name: true },
      },
    },
  });

  res.status(200).send(singlepayment);
});

router.post("/momo", directorsOnly, async (req, res) => {
  const { institutionId } = req.user;
  const { error } = validatePaymentRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const plan = await prisma.pricingPlan.findFirst({
    where: { id: req.body.planId },
  });
  if (!plan || req.body.amount < plan.price) {
    return res.status(400).send("Invalid amount or plan.");
  }

  await prisma.payment.create({
    data: {
      institutionId,
      planId: req.body.planId,
      amount: req.body.amount,
      phoneNumber: req.body.phoneNumber,
      currency: "RWF",
      status: "PENDING",
      method: "MOBILE_MONEY",
    },
  });

  res.status(200).send("Payment submitted. Awaiting confirmation.");
});

router.patch(
  "/approve/:paymentId",
  permission(["SYSTEM_ADMIN"]),
  async (req, res) => {
    const paymentId = req.params.paymentId;

    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, status: "PENDING" },
    });
    if (!payment)
      return res.status(404).send(`Payment not found or already confirmed!`);

    const institution = await prisma.institution.findFirst({
      where: { id: payment.institutionId },
    });
    if (!institution) return res.status(404).send(`Institution not found!`);

    const paymentCode = generateConfirmationCode(institution.name);
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "APPROVED",
        confirmationCode: paymentCode,
        phoneNumber: req.body.paymentCode,
      },
    });

    res
      .status(200)
      .send(`You have approved a payment with code ${paymentCode}`);
  }
);

router.patch("/confirm", permission(["SYSTEM_ADMIN"]), async (req, res) => {
  const { error } = validatePaymentConfirmation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const payment = await prisma.payment.findFirst({
    where: {
      confirmationCode: req.body.code,
      institutionId: req.user.institutionId,
      status: "APPROVED",
    },
  });

  if (!payment) return res.status(404).send(`Payment not found!`);

  const plan = await prisma.pricingPlan.findFirst({
    where: { id: payment.planId },
  });
  if (!plan) return res.status(400).send(`Can't find plan!`);

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
    prisma.institution.update({
      where: {
        id: payment.institutionId,
      },
      data: {
        tokens: {
          increment: plan.tokens,
        },
      },
    }),
  ]);

  res
    .status(200)
    .send(`🎉 Thank You for Choosing Nitibook! You can now login!`);
});

function validatePaymentRequest(request) {
  const schema = Joi.object({
    amount: Joi.number().required(),
    phoneNumber: Joi.string().required(),
    planId: Joi.string().uuid().required(),
    duration: Joi.number().required(),
  });
  return schema.validate(request);
}

function validatePaymentConfirmation(request) {
  const schema = Joi.object({
    code: Joi.string().required(),
  });
  return schema.validate(request);
}

function generateConfirmationCode(institutionName) {
  const cleaned = institutionName.trim().replace(/\s+/g, "");

  if (cleaned.length < 2) {
    throw new Error("Institution name must be at least 2 characters long.");
  }

  const first = cleaned.charAt(0).toUpperCase();
  const last = cleaned.charAt(cleaned.length - 1).toUpperCase();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);

  return `${first}${last}${randomDigits}`;
}

module.exports = router;
