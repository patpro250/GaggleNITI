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

router.get("/genres", async (req, res) => {
  const id = req.user.id;
  const institutionId = req.user.institutionId;
  const validId = id || institutionId;

  const genres = await prisma.book.findMany({
    select: {
      _count: {
        select: {
          bookCopy: true
        },
      },
      genre: true
    },
    where: {
      institutionId: validId,
      genre: { not: null }
    },
    distinct: ['genre']
  });

  const prettified = genres.map(g => ({
    genre: g.genre,
    copies: g._count.bookCopy,
  }));

  res.status(200).send(prettified);

});

router.get("/institution/dashboard", async (req, res) => {
  const institutionId = req.user.id;
  const availableLibraries = await prisma.library.findMany({ where: { institutionId }, select: { id: true } });
  const libraries = availableLibraries.map(lib => lib.id);
  const classes = await prisma.student.findMany({ where: { institutionId }, select: { className: true }, distinct: ['className'] });

  const totalBooks = await prisma.book.count({ where: { institutionId } });
  const totalCopies = await prisma.bookCopy.count({ where: { libraryId: { in: libraries } } });
  const availableBooks = await prisma.bookCopy.count({ where: { libraryId: { in: libraries }, status: 'AVAILABLE' } });
  const missingBooks = await prisma.bookCopy.count({ where: { libraryId: { in: libraries }, status: 'MISSING' } });
  const lostBooks = await prisma.bookCopy.count({ where: { libraryId: { in: libraries }, status: 'MISSING' } });
  const archivedBooks = await prisma.bookCopy.count({ where: { libraryId: { in: libraries }, status: 'INARCHIVES' } });
  const totalLibrarians = await prisma.librarian.count({ where: { institutionId } });
  const borrowedBooks = await prisma.bookCopy.count({ where: { libraryId: { in: libraries }, status: 'CHECKEDOUT' } });
  const totalAquisitions = await prisma.acquisition.count({ where: { librarianId: { in: libraries } } });
  const totalStudents = await prisma.student.count({ where: { institutionId } });
  const totalCheckedIn = await prisma.circulation.count({ where: { libraryId: { in: libraries }, returnDate: { not: null } } });
  const newBooks = await prisma.bookCopy.count({ where: { libraryId: { in: libraries }, condition: 'NEW' } });
  const overDued = await prisma.circulation.count({ where: { dueDate: { lt: new Date() } } });
  const totalClasses = classes.length;


  const result =
  {
    totalBooks, totalCopies, availableBooks, totalLibrarians, missingBooks,
    lostBooks, archivedBooks, borrowedBooks, totalAquisitions, totalStudents,
    totalCheckedIn, newBooks, overDued, totalClasses
  };

  res.status(200).send(result);
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
