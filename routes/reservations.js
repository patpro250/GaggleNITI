const express = require("express");
const Joi = require("joi");
const _ = require("lodash");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const { status } = req.query;
  let reservations;
  if (status) {
    if (!["PENDING", "REJECTED", "APPROVED"].includes(status))
      return res.status(400).send("Invalid status query parameter!");
    reservations = await prisma.reservation.findMany({
      where: { status: status },
    });
  } else {
    reservations = await prisma.reservation.findMany();
  }

  res.status(200).send(reservations);
});


router.get("/:id", async (req, res) => {
  let reservation = await prisma.reservation.findUnique({
    where: { id: req.params.id },
    include: { bookCopy: true, member: true },
  });
  if (!reservation)
    return res
      .status(404)
      .send(`The reservation with ID ${req.params.id} was not found.`);
  reservation = _.omit(reservation, ["member.password"]);
  res.status(200).send(reservation);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  let isAvailable = await prisma.bookCopy.findUnique({
    where: { id: req.body.copyId },
  });
  if (!isAvailable) return res.status(404).send("Book not found!");

  isAvailable = await prisma.bookCopy.findFirst({
    where: {
      id: req.body.copyId,
      status: "AVAILABLE",
    },
  });
  if (!isAvailable)
    return res
      .status(400)
      .send("This book is not available or maybe reserved!");

  const member = await prisma.member.findUnique({
    where: { id: req.body.memberId },
  });
  if (!member) return res.status(404).send("Member not found!");

  const institution = await prisma.institution.findUnique({
    where: { id: req.body.institutionId },
  });
  if (!institution) return res.status(404).send("Institution not found!");

  // Limit the number of reservations
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  const [updatedCopy, createdReservation] = await prisma.$transaction([
    prisma.bookCopy.update({
      where: { id: req.body.copyId },
      data: { status: "ONHOLD" },
    }),
    prisma.reservation.create({
      data: {
        memberId: req.body.memberId,
        copyId: req.body.copyId,
        dueDate: dueDate,
        institutionId: req.body.institutionId,
      },
    }),
  ]);

  res.status(201).send(createdReservation);
});

router.post("/approve/:id", async (req, res) => {
  const { error } = validateApproval(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  const reservation = await prisma.reservation.findUnique({
    where: { copyId: req.params.id },
  });
  if (!reservation)
    return res
      .status(404)
      .send(`The reservation with ID ${req.params.id} was not found.`);

  let librarian = await prisma.librarian.findUnique({
    where: { librarianId: req.body.librarianId },
  });
  if (!librarian) return res.status(404).send("Librarian not found!");

  // Use Token payload from middleware
  await prisma.$transaction([
    prisma.bookCopy.update({
      where: { id: reservation.copyId },
      data: {
        status: "RESERVED",
      },
    }),

    prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status: "APPROVED",
        librarianId: librarian.librarianId,
      },
    }),
  ]);

  res.status(200).send("Reservation approved!");
});

router.post("/reject/:id", async (req, res) => {
  const { error } = validateApproval(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  const reservation = await prisma.reservation.findUnique({
    where: { copyId: req.params.id },
  });
  if (!reservation)
    return res
      .status(404)
      .send(`The reservation with ID ${req.params.id} was not found.`);

  let librarian = await prisma.librarian.findUnique({
    where: { librarianId: req.body.librarianId },
  });
  if (!librarian) return res.status(404).send("Librarian not found!");

  await prisma.$transaction([
    prisma.bookCopy.update({
      where: { id: reservation.copyId },
      data: {
        status: "AVAILABLE",
      },
    }),

    prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status: "REJECTED",
        librarianId: librarian.librarianId,
      },
    }),
  ]);

  res.status(200).send("Reservation rejected!");
});

function validate(reservation) {
  const schema = Joi.object({
    memberId: Joi.string().required().uuid(),
    copyId: Joi.string().required().uuid(),
    institutionId: Joi.string().required().uuid(),
  });
  return schema.validate(reservation);
}

function validateApproval(reservation) {
  const schema = Joi.object({
    librarianId: Joi.string().required().uuid(),
  });
  return schema.validate(reservation);
}

module.exports = router;
