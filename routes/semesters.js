const prisma = require("./prismaClient");
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const permission = require("./prismaClient");

router.get("/academic-year/:year", async (req, res) => {
  const { year } = req.params;

  const semesters = await prisma.semester.findMany({
    where: {
      academicYearId: year,
    },
    orderBy: [{ startDate: "asc" }, { semesterName: "asc" }],
  });

  res.status(200).send(semesters);
});

router.get("/default", async (req, res) => {
  const semester = await prisma.defaultSemester.findMany();
  res.status(200).send(semester);
});

router.get("/:id", async (req, res) => {
  let semester = await prisma.semester.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!semester) {
    return res.status(404).send("Semester not found.");
  }

  res.status(200).json(semester);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const semesterCount = await prisma.semester.count({
    where: { academicYearId: req.body.academicYearId },
  });
  if (semesterCount >= 3) {
    return res
      .status(400)
      .send("An academic year cannot have more than 5 semesters.");
  }

  await prisma.semester.create({ data: req.body });
  res.status(200).send(`New semester created successfully!`);
});

router.post("/default", async (req, res) => {
  const { academicYearId, semesters } = req.body;
  const { error } = validateDefault(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const existingDefaultSemester = await prisma.defaultSemester.findFirst({
    where: { academicYearId },
  });

  if (existingDefaultSemester)
    return res
      .status(400)
      .send(
        "Only once a default semester can be assigned to an academic year."
      );

  if (!Array.isArray(semesters) || semesters.length !== 3) {
    return res.status(400).send("You must provide exactly 3 semesters.");
  }

  const semesterData = semesters.map((semester) => ({
    semesterName: semester.semesterName,
    startDate: semester.startDate,
    endDate: semester.endDate,
    academicYearId,
  }));

  await prisma.defaultSemester.createMany({
    data: semesterData,
  });

  res.status(201).send(`3 new default semesters created!`);
});

router.put("/default/activate/:semesterId", async (req, res) => {
  const semester = await prisma.defaultSemester.findUnique({
    where: { id: req.params.semesterId },
  });
  if (!semester) return res.status(404).send("Semester not found.");

  if (semester.active)
    return res.status(400).send("This semester is already active.");

  await prisma.$transaction([
    prisma.defaultSemester.updateMany({
      where: {
        active: true,
      },
      data: {
        active: false,
      },
    }),

    prisma.defaultSemester.update({
      where: { id: req.params.semesterId },
      data: { active: true },
    }),
  ]);
  res.status(200).send(`Semester activated successfully updated!`);
});

function validate(semester) {
  const schema = Joi.object({
    academicYearId: Joi.string().uuid().required(),
    semesterName: Joi.string().min(3).max(50).required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref("startDate")).required(),
  });
  return schema.validate(semester);
}

const validateDefault = (data) => {
  const schema = Joi.object({
    academicYearId: Joi.string().uuid().required(),
    semesters: Joi.array()
      .items(
        Joi.object({
          semesterName: Joi.string().min(3).max(50).required(),
          startDate: Joi.date().iso().required(),
          endDate: Joi.date().iso().greater(Joi.ref("startDate")).required(),
        })
      )
      .min(3)
      .max(3)
      .required(),
  });

  return schema.validate(data);
};

module.exports = router;
