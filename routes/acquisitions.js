const express = require("express");
const Joi = require("joi");
const generate = require("./generateCopies");
const router = express.Router();

const permission = require("../middleware/auth/permissions");

const prisma = require("./prismaClient");

router.get("/", permission(["READ"]), async (req, res) => {
  let { cursor, limit, sort } = req.query;
  limit = parseInt(limit) || 10;

  const orderBy = sort === "asc" ? { doneOn: "asc" } : { doneOn: "desc" };

  if (limit > 50) limit = 50;
  const acquisitions = await prisma.acquisition.findMany({
    where: {
      libraryId: req.user.libraryId,
    },
    include: {
      book: true,
      librarian: true,
      Library: true,
    },
    orderBy,
    take: limit,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
  });
  const nextCursor =
    acquisitions.length === limit
      ? acquisitions[acquisitions.length - 1].id
      : null;
  res.send({ nextCursor, acquisitions });
});

router.get("/schools", async (req, res) => {
  const { libraryId, institutionId } = req.user;
  const acquisitions = await prisma.acquisition.findMany({
    select: {
      book: {
        select: {
          title: true,
        },
      },
      bookCode: true,
      quantity: true,
      supplier: true
    },
    where: {
      book: {
        institutionId,
      },
    },
  });

  const formatted = acquisitions.map(a => ({
    bookTitle: a.book.title,
    code: a.bookCode,
    quantity: a.quantity,
    supplier: a.supplier,
  }));

  res.status(200).send(formatted);
});

router.get('/overview', async (req, res) => {
  const { libraryId } = req.user;
  // const suppliersGrouped = await prisma.acquisition.groupBy({
  //   where: { libraryId }
  // });
  // const totalSuppliers = suppliersGrouped.length;
  const totalAcquired = await prisma.acquisition.count({ where: { libraryId } });
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const acquiredThisMonth = await prisma.acquisition.count({
    where: {
      libraryId,
      doneOn: { gte: startOfMonth }
    }
  });

  const suppliersStats = {
    // totalSuppliers: totalSuppliers.toLocaleString(),
    totalAcquired: totalAcquired.toLocaleString(),
    acquiredThisMonth: acquiredThisMonth.toLocaleString()
  };

  res.status(200).send(suppliersStats);
});

router.get("/:id", permission(["READ"]), async (req, res) => {
  const acquisition = await prisma.acquisition.findFirst({
    where: {
      AND: [{ id: req.params.id }, { institutionId: req.user.institutionId }],
    },
    include: {
      book: true,
      librarian: true,
      institution: true,
      supplier: true,
    },
  });

  if (!acquisition) return res.status(404).send("Acquisition not found!");
  res.send(acquisition);
});

router.post("/", permission(["ACQUIRE"]), async (req, res) => {
  const { institutionId, libraryId, librarianId } = req.user;
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const LIMIT = 300;
  if (parseInt(req.body.quantity) > LIMIT)
    return res
      .status(400)
      .send(`The acquired books exceed the limit of ${LIMIT}.`);

  req.body.libraryId = libraryId;

  const copies = await generate(req.body);
  const tokensToDecrement = copies.length * 5;

  if (req.user.plan === "Plus") {
    await prisma.$transaction([
      prisma.acquisition.create({
        data: {
          book: req.body.bookId,
          quantity: req.body.quantity,
          librarian: req.user.librarianId,
          doneOn: new Date(),
          libraryId: req.body.libraryId,
          supplier: req.body.supplierId,
          book: {
            connect: { id: req.body.bookId },
          },
          Library: {
            connect: { id: req.user.libraryId },
          },
          librarian: {
            connect: { librarianId: req.user.librarianId },
          },
          supplier: {
            connect: { id: req.body.supplierId },
          },
        },
      }),
      prisma.bookCopy.createMany({ data: copies }),
    ]);
  }

  await prisma.$transaction([
    prisma.acquisition.create({
      data: {
        book: {
          connect: { id: req.body.bookId }
        },
        quantity: req.body.quantity,
        librarian: {
          connect: { librarianId }
        },
        doneOn: new Date(),
        supplier: req.body.supplier,
        bookCode: req.body.code,
        Library: {
          connect: { id: libraryId }
        },
      }
    }),
    prisma.bookCopy.createMany({ data: copies }),
    prisma.institution.update({
      where: { id: institutionId },
      data: { tokens: { decrement: tokensToDecrement } }
    })
  ]);


  const book = await prisma.book.findFirst({ where: { id: req.body.bookId } });

  res
    .status(201)
    .send(
      `${req.body.quantity} books of ${book.title} acquired from ${req.body.supplier}.`
    );
});

function validate(acquisition) {
  const schema = Joi.object({
    bookId: Joi.string().uuid().required(),
    quantity: Joi.number().integer().required(),
    supplier: Joi.string().required(),
    code: Joi.string().required(),
    dateOfAcquisition: Joi.date().iso().required(),
  });
  return schema.validate(acquisition);
}

module.exports = router;
