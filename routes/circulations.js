const express = require("express");
const Joi = require("joi");
const _ = require("lodash");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();

const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const borrowing = await prisma.circulation.findMany({
    where: { returnDate: null },
  });
  res.status(200).send(borrowing);
});

router.get("/:id", async (req, res) => {
  let borrowing = await prisma.circulation.findFirst({
    where: {
      copyId: req.params.id,
      returnDate: null
    },
    include: {
      bookCopy: true,
      member: true,
      librarian: true
    }
  });
  if (!borrowing || borrowing.length <= 0) return res.status(404).send(`Book with ID: ${req.params.id} is not issued.`);
  borrowing = _.omit(borrowing, ["member.password", "librarian.password"]);
  res.status(200).send(borrowing);
});

router.post("/lend", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let copy = await prisma.bookCopy.findFirst({where: { id: req.body.copyId }});
  if (!copy) return res.status(400).send(`Copy with ID: ${req.body.copyId} does not exist, add it to the database.`);

  let isIssued = await prisma.bookCopy.findFirst({where: {AND: [
    {id: req.body.copyId},
    {status: {in: ['CHECKEDOUT', 'DONATED']}}
  ]}});
  if (isIssued) return res.status(400).send(`Book with ID: ${req.body.copyId} is already issued.`);

  const userId = await prisma.member.findUnique({where: { id: req.body.userId }});
  if (!userId) return res.status(400).send(`User with ID: ${req.body.userId} not found`);

  const librarian = await prisma.librarian.findUnique({where: { librarianId: req.body.librarianIdNo }});
  if (!librarian) return res.status(404).send(`Librarian ${req.body.librarianId} not found`);

  const [newLoan, updatedBook] = await prisma.$transaction([
    prisma.circulation.create({
      data: {
        copyId: req.body.copyId,
        userId: req.body.userId,
        librarianIdNo: req.body.librarianIdNo,
        dueDate: req.body.dueDate
      }
    }),

    prisma.bookCopy.update({
      where: { id: req.body.copyId },
      data: {
        status: 'CHECKEDOUT'
      }
    })
  ]);
  res.status(201).send(newLoan);
});

router.post("/return", async (req, res) => {
  const { error } = validateReturn(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const isIssued = await prisma.circulation.findFirst({
    where: {
      AND: [
        {copyId: req.body.copyId},
        {returnDate:  null}
      ]
    }
  });
  if (!isIssued) return res.status(400).send("Book is not issued, please lend it!");

  const librarian = await prisma.librarian.findUnique({where: { librarianId: req.body.librarianIdNo }});
  if (!librarian) return res.status(404).send("Librarian not found!");

  const user = await prisma.circulation.findFirst({where: { userId: req.body.userId }});
  if (!user) return res.status(404).send("User not found or didn't borrow!");

  const [updateLoan, updateBook] = await prisma.$transaction([
    prisma.circulation.update({
      where: { id: isIssued.id },
      data: {
        returnDate: new Date()
      }
    }),

    prisma.bookCopy.update({
      where: { id: req.body.copyId },
      data: {
        status: 'AVAILABLE'
      }
    })
  ]);

  res.status(200).send(`Book with ID: ${req.body.copyId} returned successfully`);
});

function validate(borrow) {
  const schema = Joi.object({
    copyId: Joi.required(),
    userId: Joi.required(),
    librarianIdNo: Joi.required(),
    dueDate: Joi.date().required()
  });

  return schema.validate(borrow);
}

function validateReturn(returnData) {
  const schema = Joi.object({
    userId: Joi.required(),
    librarianIdNo: Joi.required(),
    copyId: Joi.required(),
  });
  return schema.validate(returnData);
}

module.exports = router;
