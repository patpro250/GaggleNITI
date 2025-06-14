const express = require("express");
const Joi = require("joi");
const _ = require("lodash");
const isMember = require("../middleware/auth/member");
const permission = require("../middleware/auth/permissions");

const router = express.Router();
const prisma = require("./prismaClient");

router.get("/", permission(["CIRCULATION_MANAGER"]), async (req, res) => {
  const { status } = req.query;
  const { libraryId } = req.user;

  if (status && !["PENDING", "REJECTED", "APPROVED"].includes(status)) {
    return res.status(400).send("Invalid status query parameter!");
  }

  const reservations = await prisma.reservation.findMany({
    where: {
      libraryId,
      ...(status && { status }),
    },
  });

  res.status(200).send(reservations);
});

router.get("/my-reservations", isMember, async (req, res) => {
  const memberId = req.user.id;

  const pendingReservations = await prisma.reservation.findMany({
    where: { memberId },
    orderBy: { status: "asc" },
    include: {
      bookCopy: {
        include: {
          book: true,
        },
      },
      institution: true,
    },
  });

  const formattedReservations = pendingReservations.map((entry) => {
    return {
      reservationId: entry.id,
      bookTitle: entry.bookCopy.book.title,
      reservedFrom: entry.institution.name,
      reservationDate: entry.doneOn.toISOString().split("T")[0],
      dueDate: entry.dueDate ? entry.dueDate.toISOString().split("T")[0] : null,
      status: "Pending",
    };
  });
  res.status(200).send(formattedReservations);
});

router.get("/:id", permission(["CIRCULATION_MANAGER"]), async (req, res) => {
  let reservation = await prisma.reservation.findUnique({
    where: { id: req.params.id },
    include: { bookCopy: true, member: true, institution: true },
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

  const institution = await prisma.institution.findUnique({
    where: { id: req.body.institutionId },
  });
  if (!institution) return res.status(404).send("Institution not found!");

  let settings = institution.settings.circulation;
  if (!settings.reserveBook)
    return res.status(400).send("Reservations are disabled!");

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

  const bookCopy = await prisma.bookCopy.findFirst({
    where: { id: req.body.copyId },
  });
  if (!isAvailable)
    return res.status(400).send(`This book is ${bookCopy.status}!`);

  const member = await prisma.member.findUnique({
    where: { id: req.body.memberId },
  });
  if (!member) return res.status(404).send("Member not found!");

  const limit = settings.maxLoanPeriod;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + limit);

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
    where: { id: req.params.id },
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
