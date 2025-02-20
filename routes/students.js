const express = require("express");
const Joi = require("joi");
const router = express.Router();
const _ = require("lodash");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const generateStudentCode = require("../routes/lib/generateStudentCode");

router.get("/", async (req, res) => {
  let { cursor, limit, q, sort } = req.query;
  limit = parseInt(limit) || 10;

  if (limit > 50) limit = 50;
  const orderBy = sort === 'asc' ? { createdAt: 'asc' } : { createdAt: 'desc' };

  const whereClause = {
    institutionId: req.user?.institutionId,
    ...(q && {
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } }
      ]
    }),
  };

  const students = await prisma.student.findMany({
    where: whereClause,
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy
  });

  const nextCursor = students.length === limit ? students[students.length - 1].id : null;
  res.status(200).send({ nextCursor, students });

});


router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let student = await prisma.student.findFirst({where: {OR: 
    [
      {email: req.body.email},
      {studentCard: req.body.studentCard}
    ]
  }});
  if (student) return res.status(400).send(`The student ${req.body.firstName} ${req.body.lastName} already exists`);

  const institution = await prisma.institution.findFirst({where: {id: req.user.id}});
  if (!institution) return res.status(400).send(`Invalid school assigned to student!`);

  let code = await generateStudentCode(req.body.firstName, req.body.lastName);
  req.body.code = code;
  req.body.institutionId = req.user.id;

  student = await prisma.student.create({data: req.body});
  res.status(201).send(`${student.firstName} ${student.lastName} successfully added to the system`);
});

function validate(student) {
  let schema = Joi.object({
    firstName: Joi.string().max(100).min(3).required(),
    lastName: Joi.string().max(100).min(3).required(),
    parentPhone: Joi.string()
      .min(10)
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required(),
    className: Joi.string().max(10).required(),
    status: Joi.string().valid("ACTIVE", "INACTIVE"),
    email: Joi.string().email().required(),
    studentCard: Joi.string().min(3),
  });

  return schema.validate(student);
}

module.exports = router;
