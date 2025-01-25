const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const books = await prisma.book.findMany();
  res.status(200).send(books);
});

router.post("/", async (req, res) => {
    try {
        const { name } = req.body;
        const genre = await prisma.genre.findUnique({
          where: { name:name },
          select: { id: true,name:true }
        });

        if (genre) return res.status(400).send(`${genre.id}, ${genre.name} already exists`);
        const newBook = await prisma.genre.create({ data: { name: name } });
        res.status(201).send(newBook);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
