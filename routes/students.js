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

  let student = await prisma.student.findFirst({
    where: {
      OR: [{ email: req.body.email }, { studentCard: req.body.studentCard }],
    },
  });
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
  req.body.institutionId = req.user.id;

  student = await prisma.student.create({ data: req.body });
  res
    .status(201)
    .send(
      `${student.firstName} ${student.lastName} successfully added to ${institution.name}`
    );
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
  });

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
    email: Joi.string().email().required(),
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

module.exports = router;
