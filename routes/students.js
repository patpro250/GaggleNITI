const express = require("express");
const Joi = require("joi");
const router = express.Router();
const _ = require("lodash");
const permission = require("../middleware/auth/permissions");

const prisma = require("./prismaClient");
const generateStudentCode = require("../routes/lib/generateStudentCode");

router.get("/", permission(["READ"]), async (req, res) => {
  let { cursor, limit, q, sort, status } = req.query;
  limit = parseInt(limit) || 10;
  if (limit > 50) limit = 50;

  const orderBy = sort === "asc" ? { createdAt: "asc" } : { createdAt: "desc" };
  if (status !== "ACTIVE") {
    status = "INACTIVE";
  }

  const orFilters = [];
  if (q) {
    orFilters.push(
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } }
    );
  }

  orFilters.push({ status: { equals: status } });

  const whereClause = {
    institutionId: req.user?.institutionId,
    OR: orFilters,
  };

  const students = await prisma.student.findMany({
    where: whereClause,
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy,
  });

  const nextCursor =
    students.length === limit ? students[students.length - 1].id : null;
  res.status(200).send({ nextCursor, students });
});

router.get('/overview', async (req, res) => {
  const totalStudents = await prisma.student.count({ where: { institutionId: req.user.institutionId } });
  const activeStudents = await prisma.student.count({ where: { status: 'ACTIVE', institutionId: req.user.institutionId } });
  const inactiveStudents = totalStudents - activeStudents;
  const studentsWithOverdueBooks = await prisma.circulation.count({ where: { dueDate: { lt: new Date() }, returnDate: null, studentId: { not: null } } });
  const studentsWithFines = await prisma.circulation.count({ where: { libraryId: req.user.libraryId, fine: { gt: 0 } } });
  const totalFines = await prisma.circulation.aggregate({ _sum: { fine: true }, where: { libraryId: req.user.libraryId } });
  const studentsWhoLostBooks = await prisma.circulation.count({ where: { studentId: { not: null }, bookCopy: { status: 'LOST' } } });

  const studentsStats = {
    totalStudents: totalStudents.toLocaleString(),
    activeStudents: activeStudents.toLocaleString(),
    inactiveStudents: inactiveStudents.toLocaleString(),
    studentsWithOverdueBooks: studentsWithOverdueBooks.toLocaleString(),
    studentsWithFines: studentsWithFines.toLocaleString(),
    totalFines: totalFines._sum.fine?.toFixed(2) || "0.00",
    studentsWhoLostBooks: studentsWhoLostBooks.toLocaleString()
  };

  res.status(200).send(studentsStats);
});

router.get("/:id", async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
  });
  if (!student)
    return res.status(404).send(`Student not found! That's all we know`);
  res.status(200).send(student);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let student = await prisma.student.findFirst({ where: { className: req.body.className, firstName: req.body.firstName, lastName: req.body.lastName } });
  if (student)
    return res
      .status(400)
      .send(
        `The student ${req.body.firstName} ${req.body.lastName} already exists`
      );

  const institution = await prisma.institution.findFirst({
    where: { id: req.user.id },
  });
  if (!institution)
    return res.status(400).send(`Invalid school assigned to student!`);

  let code = await generateStudentCode(req.body.firstName, req.body.lastName);
  req.body.code = code;
  req.body.className = _.toUpper(req.body.className);
  req.body.institutionId = req.user.institutionId;

  student = await prisma.student.create({ data: req.body });
  res
    .status(201)
    .send(
      `${student.firstName} ${student.lastName} successfully added to ${institution.name}`
    );
});

router.put("/promote", async (req, res) => {
  const { error } = validatePromotion(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { maxLowLevel, maxHighLevel, excludedCodes } = req.body;
  const students = await prisma.student.findMany({
    where: {
      institutionId: req.user.institutionId,
      NOT: {
        code: { in: excludedCodes },
      },
    },
    select: { id: true, className: true, code: true },
  });

  if (students.length === 0)
    return res.status(404).send("No students found in this institution.");

  const updates = students
    .map((student) => {
      const classNumber = extractClassNumber(student.className);
      if (classNumber !== null) {
        let maxClass = classNumber <= maxLowLevel ? maxLowLevel : maxHighLevel;
        if (classNumber < maxClass) {
          const newClassName = student.className.replace(
            classNumber,
            classNumber + 1
          );
          return prisma.student.update({
            where: { id: student.id },
            data: { className: newClassName },
          });
        }
      }
      return null;
    })
    .filter(Boolean);

  await prisma.$transaction(updates);

  res.status(200).send(`${updates.length} successfully promoted!`);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let student = await prisma.student.findUnique({
    where: { id: req.params.id },
  });
  if (!student)
    return res
      .status(404)
      .send(`The student with code: ${req.body.code} does't exist!`);

  let exists = await prisma.student.findFirst({
    where: {
      AND: [
        {
          OR: [
            { email: req.body.email },
            { studentCard: req.body.studentCard },
          ],
        },
        {
          NOT: { id: req.params.id },
        },
      ],
    },
  }); g / schools / dashboard

  if (exists)
    return res
      .status(400)
      .send(
        `The student ${req.body.firstName} ${req.body.lastName} already exists`
      );
  await prisma.student.update({ where: { id: req.params.id }, data: req.body });
  res.status(200).send(`${req.body.firstName} Updated successfully.`);
});

router.put("/de-activate/:id", async (req, res) => {
  let student = await prisma.student.findUnique({
    where: { id: req.params.id },
  });
  if (!student) return res.status(404).send(`Student not found!`);
  student = await prisma.student.update({
    where: { id: req.params.id },
    data: { status: "INACTIVE" },
  });
  res
    .status(200)
    .send(`${student.firstName} ${student.lastName} is now ${student.status}`);
});

function validate(student) {
  let schema = Joi.object({
    firstName: Joi.string().max(100).min(3).required(),
    lastName: Joi.string().max(100).min(3).required(),
    parentPhone: Joi.string()
      .min(10)
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required(),
    email: Joi.string().email(),
    studentCard: Joi.string().min(3),
    className: Joi.string()
      .custom((value, helpers) => {
        const matches = value.match(/\d+/g) || [];
        if (matches.length !== 1) {
          return helpers.error("any.invalid");
        }
        return value;
      }, "Single numeric sequence validation")
      .required(),
  });

  return schema.validate(student);
}

function validatePromotion(promote) {
  let schema = Joi.object({
    maxLowLevel: Joi.number().integer().min(1).required(),
    maxHighLevel: Joi.number().integer().min(1).required(),
    excludedCodes: Joi.array().items(Joi.string()),
  });
  return schema.validate(promote);
}

function extractClassNumber(className) {
  const match = className.match(/\d+/);
  return match ? parseInt(match[0]) : null;
}

module.exports = router;
