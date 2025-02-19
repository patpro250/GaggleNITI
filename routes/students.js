const express = require("express");
const Joi = require("joi");
const router = express.Router();
const _ = require("lodash");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
    email: Joi.email().required(),
    studentCard: Joi.string().min(3),
  });
}

module.exports = router;
