const express = require("express");
const languageCodes = require("./lib/languages");
const router = express.Router();
const Joi = require("joi");
const isMember = require("../middleware/auth/member");
const { startOfMonth, startOfYear, subYears, subMonths, endOfYear } = require("date-fns");

const permission = require("../middleware/auth/permissions");

const prisma = require("./prismaClient");

router.get("/", permission(["READ"]), async (req, res) => {
  let { cursor, limit, q, sort, language } = req.query;
  limit = parseInt(limit) || 10;

  if (limit > 50) limit = 50;
  const orderBy = sort === "asc" ? { createdAt: "asc" } : { createdAt: "desc" };

  const whereClause = {
    institutionId: req.user?.institutionId,
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { author: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(language && { language: { equals: language, mode: "insensitive" } }),
  };

  const books = await prisma.book.findMany({
    where: whereClause,
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy,
  });

  const nextCursor = books.length === limit ? books[books.length - 1].id : null;
  res.status(200).send({ nextCursor, books });
});

router.get('/schools', async (req, res) => {
  const { libraryId } = req.user;

  const books = await prisma.book.findMany({
    include: {
      bookCopy: {
        where: { libraryId },
      },
    },
    orderBy: { createdAt: 'desc' }
  });

  const formattedBooks = books.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    publisher: book.publisher,
    genre: book.genre,
    language: book.language,
    totalCopies: book.bookCopy.length,
    dateAquired: book.firstAcquisition,
    availableCopies: book.bookCopy.filter((copy) => copy.status === "AVAILABLE").length,
  }));

  res.status(200).send(formattedBooks);
});

router.get('/overview', async (req, res) => {
  const libraryId = req.user.libraryId;
  if (!libraryId) return res.status(400).send('No Library Provided!');

  const totalBooks = await prisma.book.count({
    where: { institutionId: req.user.institutionId }
  });

  const totalCopies = await prisma.bookCopy.count({ where: { libraryId } });

  const available = await prisma.bookCopy.count({
    where: { status: 'AVAILABLE', libraryId }
  });

  const checkedOut = await prisma.bookCopy.count({
    where: { status: 'CHECKEDOUT', libraryId }
  });

  const reserved = await prisma.bookCopy.count({
    where: { status: 'RESERVED', libraryId }
  });

  const missing = await prisma.bookCopy.count({
    where: { status: 'MISSING', libraryId }
  });

  const damaged = await prisma.bookCopy.count({
    where: { condition: 'DAMAGED', libraryId }
  });

  // Check for new arrivals
  const threeMonthsAgoStart = startOfMonth(subMonths(new Date(), 3));
  const today = new Date();

  const newBooks = await prisma.book.count({
    where: {
      institutionId: req.user.institutionId,
      createdAt: {
        gte: threeMonthsAgoStart,
        lte: today,
      },
    },
  });

  const newBookCopies = await prisma.bookCopy.count({
    where: { condition: 'NEW', libraryId }
  });

  // Calculate old books
  const tenYearsAgoStart = startOfYear(subYears(new Date(), 10));
  const tenYearsAgoEnd = endOfYear(subYears(new Date(), 10));

  const oldBooks = await prisma.book.count({
    where: {
      firstAcquisition: {
        gte: tenYearsAgoStart,
        lte: tenYearsAgoEnd,
      },
    },
  });

  const archived = await prisma.bookCopy.count({
    where: { status: 'INARCHIVES', libraryId }
  });

  const bookStats = {
    totalBooks: totalBooks.toLocaleString(),
    available: available.toLocaleString(),
    totalCopies: totalCopies.toLocaleString(),
    checkedOut: checkedOut.toLocaleString(),
    reserved: reserved.toLocaleString(),
    missing: missing.toLocaleString(),
    damaged: damaged.toLocaleString(),
    new: newBooks.toLocaleString(),
    old: oldBooks.toLocaleString(),
    newBookCopies: newBookCopies.toLocaleString(),
    archived: archived.toLocaleString()
  };

  res.status(200).send(bookStats);
});

router.get('/suggestions', async (req, res) => {
  const institutionId = req.user.institutionId;

  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Query is required" });

  const books = await prisma.book.findMany({
    where: { title: { contains: query, mode: 'insensitive' }, institutionId },
    select: { title: true, id: true },
    take: 5
  });

  res.status(200).send(books);

});

router.get("/institution", permission(["DIRECTOR"]), async (req, res) => {
  const institutionId = req.user.institutionId;

  const libraries = await prisma.library.findMany({
    where: { institutionId },
    select: { id: true },
  });

  const libraryIds = libraries.map((library) => library.id);

  const totalBooks = await prisma.bookCopy.count({
    where: { libraryId: { in: libraryIds } },
  });

  const availableBooks = await prisma.bookCopy.count({
    where: { libraryId: { in: libraryIds }, status: "AVAILABLE" },
  });

  const borrowedBooks = await prisma.bookCopy.count({
    where: { libraryId: { in: libraryIds }, status: "CHECKEDOUT" },
  });

  const overdueBooks = await prisma.circulation.count({
    where: {
      libraryId: { in: libraryIds },
      dueDate: { lt: new Date() },
    },
  });

  res.status(200).send({
    totalBooks,
    availableBooks,
    borrowedBooks,
    overdueBooks,
  });
});

router.get("/recommended", isMember, async (req, res) => {
  const userId = req.user.id;

  const userActivity = await prisma.favoriteBook.findMany({
    where: { memberId: userId },
    include: { book: true },
  });

  const borrowedBooks = await prisma.circulation.findMany({
    where: { userId },
    include: { bookCopy: { include: { book: true } } },
  });

  const interactedBooks = [
    ...userActivity.map((fb) => fb.book),
    ...borrowedBooks.map((bc) => bc.bookCopy.book),
  ];

  let recommendedBooks;

  if (interactedBooks.length === 0) {
    recommendedBooks = await prisma.book.findMany({
      orderBy: {
        favoriteBook: { _count: "desc" },
      },
      take: 10,
      select: {
        id: true,
        title: true,
        author: true,
        publisher: true,
        edition: true,
        language: true,
      },
    });
  } else {
    const favoriteGenres = interactedBooks
      .map((book) => book.genre)
      .filter(Boolean);

    recommendedBooks = await prisma.book.findMany({
      where: {
        genre: { in: favoriteGenres },
        id: { notIn: interactedBooks.map((book) => book.id) },
      },
      take: 10,
      select: {
        id: true,
        title: true,
        author: true,
        publisher: true,
        edition: true,
        language: true,
      },
    });
  }

  res.status(200).send(recommendedBooks);
});

router.get("/popular", async (req, res) => {
  const popularBooks = await prisma.book.findMany({
    take: 5,
    orderBy: {
      bookCopy: {
        _count: "desc",
      },
    },
    select: {
      id: true,
      title: true,
      author: true,
      publisher: true,
      _count: {
        select: {
          bookCopy: true,
        },
      },
    },
  });

  res.status(200).send(popularBooks);
});

router.get('/most-borrowed', async (req, res) => {
  const mostBorrowed = await prisma.book.findMany({
    include: {
      bookCopy: {
        select: {
          circulation: true
        },
      }
    },
    take: 5
  });
  res.status(200).send(mostBorrowed);
});

router.get("/newest", async (req, res) => {
  const newestBook = await prisma.bookCopy.findFirst({
    where: { libraryId: req.user.libraryId },
    orderBy: { dateOfAcquisition: "desc" },
    select: { dateOfAcquisition: true, book: true },
  });
  if (!newestBook)
    return res.status(404).send(`No books found in your library🤔!`);
  res.status(200).send(newestBook);
});

router.get("/oldest", async (req, res) => {
  const oldestBook = await prisma.bookCopy.findFirst({
    where: { libraryId: req.user.libraryId },
    orderBy: { dateOfAcquisition: "asc" },
    select: { dateOfAcquisition: true, book: true },
  });

  if (!oldestBook)
    return res.status(404).send(`No book found in your library🤔!`);
  res.status(200).send(oldestBook);
});

router.get("/:id", async (req, res) => {
  let book = await prisma.book.findFirst({
    where: { id: req.params.id },
    include: {
      institution: {
        select: { name: true, email: true, id: true },
      },
    },
  });
  if (!book) return res.status(404).send(`This book is not found`);
  res.status(200).send(book);
});

router.post("/", permission(["MANAGE_BOOKS"]), async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const exists = await prisma.book.findFirst({
    where: {
      institutionId: req.user.institutionId,
      edition: req.body.edition,
      title: req.body.title
    },
  });

  if (exists)
    return res
      .status(400)
      .send(
        `'${req.body.title}' edition: '${req.body.edition}' already exists in library collection`
      );

  const institution = await prisma.institution.findUnique({
    where: { id: req.user.institutionId },
  });

  req.body.institutionId = req.user.institutionId;

  if (!institution) return res.status(404).send("Institution not found");
  let book = await prisma.book.create({ data: req.body });

  res.status(201).send(`${book.title} is added in Library collection`);
});

router.put("/:id", permission(["MANAGE_BOOKS"]), async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let book = await prisma.book.findUnique({ where: { id: req.params.id } });
  if (!book)
    return res.status(404).send(`Book with ID: ${req.params.id} doesn't exist`);

  book = await prisma.book.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.status(200).send("Book successfully updated!");
});

function validate(book) {
  const schema = Joi.object({
    title: Joi.string().required().min(3),
    author: Joi.string().required().min(3),
    publisher: Joi.string().required().min(2),
    published: Joi.date(),
    firstAcquisition: Joi.date().required(),
    isbn: Joi.string().min(10),
    placeOfPublication: Joi.string(),
    language: Joi.string()
      .valid(...languageCodes)
      .required(),
    edition: Joi.string().max(20),
    numberOfPages: Joi.number().min(5).max(10000).required(),
    lccCode: Joi.string().min(4).max(50),
    genre: Joi.string(),
    ddcCode: Joi.string().max(15),
  });
  return schema.validate(book);
}

module.exports = router;
