const prisma = require("./prismaClient");
const express = require("express");
const Joi = require("joi");
const router = express.Router();

router.get("/", async (req, res) => {
  const academicYears = await prisma.academicYear.findMany({
    where: { institutionId: req.user.institutionId },
    orderBy: {
      academicYear: "desc",
    },
  });

  res.status(200).send(academicYears);
});

router.get("/active", async (req, res) => {
  const activeAcademicYear = await prisma.academicYear.findFirst({
    where: {
      institutionId: req.user.institutionId,
      isActive: true,
    },
  });

  if (!activeAcademicYear) {
    return res.status(404).send("No active academic year found.");
  }

  res.status(200).send(activeAcademicYear);
});

router.get("/default-academic-year", async (req, res) => {
  const year = await prisma.defaultAcademicYear.findFirst({
    where: { active: true },
  });
  if (!year) return res.status(404).send(`There is no default academic year!`);
  res.status(200).send(year);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const exists = await prisma.academicYear.findFirst({
    where: {
      academicYear: req.body.academicYear,
      institutionId: req.user.institutionId,
    },
  });
  if (exists)
    return res
      .status(200)
      .send(`Academic Year: ${req.body.academicYear} already exists!`);

  const active = await prisma.academicYear.findFirst({
    where: { isActive: true, institutionId: req.user.institutionId },
  });
  if (active)
    return res
      .status(400)
      .send(`There is already an active academic year for this institution.`);

  await prisma.academicYear.create({
    data: {
      institutionId: req.user.institutionId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      academicYear: req.body.academicYear,
    },
  });

  res
    .status(200)
    .send(
      `You have successfully created the academic year: ${req.body.academicYear}`
    );
});

router.put("/:id", async (req, res) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const existingAcademicYear = await prisma.academicYear.findFirst({
    where: {
      institutionId: req.user.institutionId,
      academicYear: req.body.academicYear,
      NOT: {
        id: req.params.id,
      },
    },
  });

  if (existingAcademicYear)
    return res
      .status(400)
      .send(
        `Academic Year ${req.body.academicYear} already exists for this institution.`
      );

  const academicYear = await prisma.academicYear.findUnique({
    where: { id: req.params.id },
  });

  if (!academicYear)
    return res
      .status(404)
      .send(`Academic Year with ID ${req.params.id} not found.`);

  await prisma.academicYear.update({
    where: { id: req.params.id },
    data: {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      academicYear: req.body.academicYear,
    },
  });
  res
    .status(200)
    .send(`Academic year: ${req.body.academicYear}, updated successfully!`);
});

router.post("/default", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const exists = await prisma.defaultAcademicYear.findFirst({
    where: { academicYear: req.body.academicYear },
  });
  if (exists)
    return res.status(400).send(`${req.body.academicYear} already exists!`);

  await prisma.defaultAcademicYear.create({ data: req.body });
  res.status(200).send(`Default academic year created!`);
});

router.put("/activate/:yearId", async (req, res) => {
  const academicYear = await prisma.defaultAcademicYear.findUnique({
    where: { id: req.params.yearId },
  });
  if (!academicYear) return res.status(404).send("Academic year not found.");

  if (academicYear.active)
    return res.status(400).send("This academic year is already active.");

  await prisma.$transaction([
    prisma.defaultAcademicYear.updateMany({
      where: { active: true },
      data: { active: false },
    }),

    prisma.defaultAcademicYear.update({
      where: { id: req.params.yearId },
      data: { active: true },
    }),
  ]);
  res.status(200).send("Academic year activated successfully!");
});

function validate(academicYear) {
  const schema = Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref("startDate")).required(),
    academicYear: Joi.string().min(4).max(20).required(),
  });
  return schema.validate(academicYear);
}

module.exports = router;
