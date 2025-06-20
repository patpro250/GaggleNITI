const express = require("express");
const router = express.Router();
const prisma = require("./prismaClient");

router.get("/members", async (req, res) => {
  const { query } = req.query;
  if (!query || typeof query !== "string")
    return res.status(400).send("Query is required");

  const books = await prisma.book.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { author: { contains: query, mode: "insensitive" } },
        { publisher: { contains: query, mode: "insensitive" } },
        { genre: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      title: true,
      author: true,
      publisher: true,
      published: true,
      institution: {
        select: {
          name: true,
          address: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  const institutions = await prisma.institution.findMany({
    where: {
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          address: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      rating: true,
      openingHours: true,
    },
  });

  return res.status(200).json({ books, institutions });
});

module.exports = router;
