const express = require("express");
const router = express.Router();

const prisma = require("./prismaClient");

router.get("/institution/account", async (req, res) => {
  const { id } = req.user;

  const institution = await prisma.institution.findFirst({ where: { id }, select: { id: true } });
  if (!institution) return res.status(400).send(`Can't find institution`);

  const totalLibrarians = await prisma.librarian.count({ where: { institutionId: institution.id } });
  const totalStudents = await prisma.student.count({ where: { institutionId: institution.id } });
  const totalBooks = await prisma.book.count({ where: { institutionId: institution.id } });

  const response = { totalBooks, totalLibrarians, totalStudents };
  res.status(200).send(response);
});

router.get("/Ac", async (req, res) => {
  try {
    const { id } = req.user; // Make sure req.user exists from auth middleware

    const institution = await prisma.institution.findFirst({
      where: {
        id: id, // Corrected key name syntax
      },
    });

    const totalLibrarians = await prisma.librarian.count({
      where: {
        institutionId: id,
      },
    });

    if (!totalLibrarians) {
      return res.status(404).json({ message: "Librarian not found" });
    }

    // const totalStudent = await prisma.student.count({
    //   where: {
    //     institutionId: id,
    //   },
    // });

    // if (!totalStudent) {
    //   res.status(404).json({ message: "Student not found" });
    // }

    // const totalBooks = await prisma.book.count({
    //   where: {
    //     institutionId: id,
    //   },
    // });

    // if (!totalBooks) {
    //   return res.status(404).json({ message: "Book not found" });
    // }

    // const totalBookCopy = await prisma.bookCopy.count({
    //   where: {
    //     institutionId: id,
    //   },
    // });

    // if (!totalBookCopy) {
    //   return res.status(404).json({ message: "Book Copy not found" });
    // }

    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    res.status(200).json({
      message: "Testing Analytics panel",
      totalLibrarians,
      //   totalStudent,
      //   totalBooks,
      //   totalBookCopy,
    });
  } catch (error) {
    console.error("Error fetching institution:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
