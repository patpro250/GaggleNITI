const express = require("express");
const router = express.Router();
const prisma = require("./prismaClient");

router.get("/", async (req, res) => {
  const memberId = req.user.id;

  const favorites = await prisma.favoriteBook.findMany({
    where: { memberId },
    select: {
      book: {
        select: {
          title: true,
          author: true,
          publisher: true,
          language: true,
          edition: true,
          published: true,
        },
      },
    },
  });

  const books = favorites.map((favorite) => favorite.book);

  res.status(200).send(books);
});

router.post("/:bookId", async (req, res) => {
  const memberId = req.user.id;
  const { bookId } = req.params;

  const bookExists = await prisma.book.findFirst({ where: { id: bookId } });
  if (!bookExists) return res.status(404).send(`Book doesn't exist!`);

  const favoriteExists = await prisma.favoriteBook.findFirst({
    where: { memberId, bookId },
  });
  if (favoriteExists)
    return res.status(400).send(`You have already liked this book!`);

  await prisma.favoriteBook.create({ data: { memberId, bookId } });
  res.status(201).send(`Book added to favorites!`);
});

router.delete("/:bookId", async (req, res) => {
  const memberId = req.user.id;
  const { bookId } = req.params;

  const favorite = await prisma.favoriteBook.findFirst({
    where: { memberId, bookId },
  });
  if (!favorite) return res.status(404).send("Book not in favorites");

  await prisma.favoriteBook.delete({
    where: { memberId_bookId: { memberId, bookId } },
  });

  res.status(200).send("Book removed from favorites");
});

module.exports = router;
