const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const {
  validate,
  validateUpdate,
  validatePassword,
} = require("../routes/lib/member");

const isMember = require("../middleware/auth/member");
const permission = require("../middleware/auth/permissions");

const prisma = require("./prismaClient");

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let member = await prisma.member.findUnique({
    where: { email: req.body.email },
  });
  if (member)
    return res
      .status(400)
      .send(`Member with email: ${req.body.email} already exists!`);

  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  await prisma.member.create({ data: req.body });
  res
    .status(201)
    .send(`${req.body.firstName} ${req.body.lastName} created successfully`);
});

router.use(isMember);
router.get("/", async (req, res) => {
  let members = await prisma.member.findMany();
  members = members.map((member) => _.omit(member, ["password"]));
  res.status(200).send(members);
});

router.post("/change-password", async (req, res) => {
  if (!req.body.newPassword || !req.body.newPassword)
    return res.status(400).send("New Password required");
  const { error } = validatePassword(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let member = await prisma.member.findUnique({ where: { id: req.user.id } });
  if (!member) return res.status(404).send("Member not found!");

  const isSame = await bcrypt.compare(req.body.oldPassword, member.password);
  if (!isSame) return res.status(400).send("Passwords doesn't match!");

  const salt = await bcrypt.genSalt(10);
  req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);
  await prisma.member.update({
    where: { id: req.user.id },
    data: {
      password: req.body.newPassword,
    },
  });

  res.status(200).send("Password Changed successfully!");
});

router.get("/recent-activities", async (req, res) => {
  const memberId = req.user.id;
  const activities = await prisma.circulation.findMany({
    where: { userId: memberId },
    include: {
      bookCopy: {
        include: {
          book: true,
        },
      },
    },
    orderBy: { lendDate: "desc" },
    take: 10,
  });

  const formattedActivities = activities.map((entry) => {
    return {
      activityType: entry.returnDate ? "Returned" : "Checked Out",
      bookTitle: entry.bookCopy.book.title,
      date: entry.returnDate
        ? entry.returnDate.toISOString().split("T")[0]
        : entry.lendDate.toISOString().split("T")[0],
      status: "Completed",
    };
  });

  res.status(200).send(formattedActivities);
});

router.get("/stats", async (req, res) => {
  const memberId = req.user.id;

  const borrowed = await prisma.circulation.count({
    where: { userId: memberId, returnDate: null },
  });

  const overDue = await prisma.circulation.count({
    where: { userId: memberId, dueDate: { lt: new Date() }, returnDate: null },
  });

  const activeReservations = await prisma.reservation.count({
    where: { memberId, status: "PENDING" },
  });

  const inFines = await prisma.member.findUnique({
    where: { id: memberId },
    select: { fine: true },
  });

  const stats = {
    borrowed,
    overDue,
    activeReservations,
    inFines: inFines?.fine || 0,
  };

  res.status(200).send(stats);
});

router.get("/settings", async (req, res) => {
  let member = await prisma.member.findUnique({ where: { id: req.user.id } });
  if (!member) return res.status(404).send("Member not found");
  member = _.omit(member, ["password"]);
  res.status(200).send(member);
});

router.put("/", async (req, res) => {
  const { error } = validateUpdate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let member = await prisma.member.findFirst({ where: { id: req.user.id } });
  if (!member) return res.status(404).send("Member not found");

  member = _.omit(req.body, ["password", "email", "phone"]);

  await prisma.member.update({ where: { id: req.user.id }, data: member });
  res
    .status(200)
    .send(`${req.body.firstName} ${req.body.lastName} updated successfully!`);
});

module.exports = router;
