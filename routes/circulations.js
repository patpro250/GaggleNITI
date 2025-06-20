const express = require("express");
const Joi = require("joi");
const now = require("../routes/lib/now");
const _ = require("lodash");
const router = express.Router();
const { formatDistanceToNow } = require("date-fns");

const circulationPricing = require("../middleware/circulationPricing");
const permission = require("../middleware/auth/permissions");

const prisma = require("./prismaClient");

router.get("/", permission(["READ"]), async (req, res) => {
  const { libraryId } = req.user;
  const circulations = await prisma.circulation.findMany({
    orderBy: { lendDate: "desc" },
    where: { libraryId },
    include: {
      bookCopy: {
        include: {
          book: true,
        },
      },
      member: true,
      student: true,
      librarian: true,
      library: true,
    },
  });


  const result = circulations.map((c) => {
    const borrowerName =
      c.member?.fullName ||
      `${c.student?.firstName || ""} ${c.student?.lastName || ""}`.trim() ||
      "Unknown";

    const book = c.bookCopy?.book;
    const bookTitle = book?.title || "Unknown Title";
    const bookCode = c.bookCopy?.code || book?.code || "Unknown Code";

    const timeSinceBorrowing = formatDistanceToNow(new Date(c.lendDate), {
      addSuffix: false,
    });

    return {
      borrowerName,
      bookTitle,
      bookCode,
      timeSinceBorrowing,
      status: c.returnDate ? "Returned" : "Borrowed",
      dueDate: c.dueDate.toISOString().split("T")[0],
      fines: `$${c.fine?.toFixed(2) || "0.00"}`,
      comment: c.comment,
      lendDate: c.lendDate.toLocaleDateString()
    };
  });
  res.status(200).send(result);
  // const { year } = req.query;

  // let whereCondition = { returnDate: null, libraryId: req.user.libraryId };
  // const institutionType = await prisma.institution.findFirst({
  //   where: { id: req.user.institutionId },
  // });

  // let academicYear;

  // if (institutionType.type === "UNIVERSITY") {
  //   academicYear = await prisma.academicYear.findFirst({
  //     where: {
  //       academicYear: year,
  //       institutionId: req.user.institutionId,
  //     },
  //   });
  // } else {
  //   academicYear = await prisma.defaultAcademicYear.findFirst({
  //     where: { academicYear: year },
  //   });
  // }

  // if (!academicYear) return res.status(404).send("Academic Year not found.");

  // whereCondition = {
  //   ...whereCondition,
  //   startDate: { gte: academicYear.startDate },
  //   endDate: { lte: academicYear.endDate },
  // };

  // const borrowing = await prisma.circulation.findMany({
  //   where: whereCondition,
  // });

  // if (borrowing.length === 0)
  //   return res
  //     .status(404)
  //     .send(`No circulation records found for this academic year.`);

  // res.status(200).send(borrowing);
});

router.get('/overview', async (req, res) => {
  const { libraryId } = req.user;

  const borrowed = await prisma.circulation.count({ where: { libraryId } });
  const returned = await prisma.circulation.count({ where: { returnDate: { not: null }, libraryId } });
  const loans = await prisma.circulation.count({ where: { returnDate: null, libraryId } });
  const overdue = await prisma.circulation.count({ where: { dueDate: { lt: new Date() }, returnDate: null, libraryId } });

  const circulationStats = {
    borrowed: borrowed.toLocaleString(),
    returned: returned.toLocaleString(),
    loans: loans.toLocaleString(),
    overdue: overdue.toLocaleString()
  };
  res.status(200).send(circulationStats);
});

router.get("/current-loans", async (req, res) => {

  const overdueBooks = await prisma.circulation.findMany({
    where: { dueDate: { lt: new Date() }, returnDate: null },
    include: {
      bookCopy: {
        include: {
          book: true,
        },
      },
    },
  });

  const formattedBooks = overdueBooks.map((entry) => {
    const overdueDays = Math.max(
      Math.floor(
        (new Date() - new Date(entry.dueDate)) / (1000 * 60 * 60 * 24)
      ),
      0
    );

    return {
      title: entry.bookCopy.book.title,
      code: entry.bookCopy.id,
      author: entry.bookCopy.book.author,
      publisher: entry.bookCopy.book.publisher,
      overdueDays,
    };
  });

  res.status(200).send(formattedBooks);
});

router.get("/students", async (req, res) => {
  const circulations = await prisma.circulation.findMany({
    where: { libraryId: req.user.libraryId, studentId: { not: null } },
  });
  if (circulations.length === 0)
    return res.status(404).send(`There is no student in circulations!`);
  res.status(200).send(circulations);
});

router.get("/members", async (req, res) => {
  const circulations = await prisma.circulation.findMany({
    where: { libraryId: req.user.libraryId, userId: { not: null } },
  });
  if (circulations.length === 0)
    return res.status(404).send(`There is no member in circulations!`);
  res.status(200).send(circulations);
});

router.get("/:id", permission(["READ"]), async (req, res) => {
  let borrowing = await prisma.circulation.findFirst({
    where: {
      AND: [{ copyId: req.params.id }, { returnDate: null }],
    },
    include: {
      bookCopy: true,
      member: true,
      librarian: true,
    },
  });
  if (!borrowing || borrowing.length <= 0)
    return res
      .status(404)
      .send(`Book with ID: ${req.params.id} is not issued.`);
  borrowing = _.omit(borrowing, ["member.password", "librarian.password"]);
  res.status(200).send(borrowing);
});

router.post("/request-book", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let copy = await prisma.bookCopy.findFirst({
    where: { id: req.body.copyId },
  });
  if (!copy)
    return res
      .status(400)
      .send(
        `Copy with ID: ${req.body.copyId} does not exist, add it to to your Institution.`
      );

  let isAvailable = await prisma.bookCopy.findFirst({
    where: { id: req.body.copyId, status: "AVAILABLE" },
  });
  if (!isAvailable)
    return res.status(400).send(`Book is ${copy.status} not accessible!`);

  const user = await prisma.member.findUnique({
    where: { email: req.body.email },
  });

  if (!user)
    return res.status(400).send(`User with Email: ${req.body.email} not found`);

  await prisma.$transaction([
    prisma.bookRequest.create({
      data: {
        userId: user.id,
        copyId: req.body.copyId,
      },
    }),

    prisma.bookCopy.update({
      where: { id: req.body.copyId },
      data: {
        status: "REQUESTED",
      },
    }),
  ]);

  res
    .status(200)
    .send(`Book copy with code: ${copy.code} requested successfully!`);
});

router.use(permission(["CIRCULATION_MANAGER"]));

router.post("/lend/student", circulationPricing, async (req, res) => {
  const { error } = validateStudentBorrow(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let librarian = await prisma.librarian.findFirst({
    where: { librarianId: req.user.librarianId },
  });
  if (!librarian) return res.status(404).send(`Librarian not found`);

  let copy = await prisma.bookCopy.findFirst({
    where: { code: req.body.code },
  });
  if (!copy)
    return res
      .status(400)
      .send(
        `Copy with code: ${req.body.code} does not exist, add it to your School Library.`
      );

  let isAvailable = await prisma.bookCopy.findFirst({
    where: { id: copy.id, status: "AVAILABLE" },
  });
  if (!isAvailable)
    return res
      .status(400)
      .send(`This book is already ${copy.status}!`);

  let institution = await prisma.institution.findFirst({
    where: { id: req.user.institutionId },
  });
  const student = await prisma.student.findFirst({
    where: { code: req.body.studentCode },
  });
  if (!student)
    return res.status(400).send(`Student doesn't exist, create one!`);

  if (!(student.institutionId === institution.id)) {
    let school = await prisma.institution.findFirst({
      where: { id: student.institutionId },
    });
    return res
      .status(400)
      .send(
        `${student.lastName} is in ${school.name}, and is not allowed to borrow in our School Library`
      );
  }

  if (req.user.plan === 'Plus') {
    await prisma.$transaction([
      prisma.circulation.create({
        data: {
          copyId: copy.id,
          studentId: student.id,
          librarianIdNo: req.user.librarianId,
          dueDate: new Date(req.body.dueDate),
          libraryId: req.user.libraryId,
          comment: req.body.comment
        },
      }),
      prisma.bookCopy.update({
        where: { id: copy.id },
        data: {
          status: "CHECKEDOUT",
        },
      }),
    ]);
  }
  await prisma.$transaction([
    prisma.circulation.create({
      data: {
        copyId: copy.id,
        studentId: student.id,
        librarianIdNo: req.user.librarianId,
        dueDate: new Date(req.body.dueDate),
        libraryId: req.user.libraryId,
        comment: req.body.comment
      },
    }),
    prisma.bookCopy.update({
      where: { id: copy.id },
      data: {
        status: "CHECKEDOUT",
      },
    }),
    prisma.institution.update({
      where: {
        id: institution.id
      },
      data: {
        tokens: {
          decrement: 10
        }
      }
    })
  ]);


  let book = await prisma.book.findFirst({ where: { id: copy.bookId } });

  res
    .status(200)
    .send(
      `${librarian.firstName} ${librarian.lastName} you have lent '${book.title
      }' with author: ${book.author}, publisher: ${book.publisher}, code: ${copy.code
      }, call number: ${book.callNo || 'N/A'} to ${student.firstName} ${student.lastName
      }. On ${now()}`
    );
});

router.post("/return/student", circulationPricing, async (req, res) => {
  const { error } = validateStudentReturn(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const copy = await prisma.bookCopy.findFirst({
    where: { code: req.body.code, status: "CHECKEDOUT" },
  });
  if (!copy) return res.status(400).send("The book copy is not issued or not in your library!");

  const student = await prisma.student.findFirst({
    where: { code: req.body.studentCode, institutionId: req.user.institutionId },
  });
  if (!student) return res.status(400).send("No student found in your School");

  const isIssued = await prisma.circulation.findFirst({
    where: { copyId: copy.id, returnDate: null, studentId: student.id },
  });
  if (!isIssued) return res.status(400).send("This copy is not issued, please lend it!");

  const librarian = await prisma.librarian.findUnique({
    where: { librarianId: req.user.librarianId },
  });
  if (!librarian) return res.status(404).send("Librarian not found!");

  if (req.user.plan === 'Plus') {
    await prisma.$transaction([
      prisma.circulation.update({
        where: { id: isIssued.id },
        data: { returnDate: new Date() },
      }),
      prisma.bookCopy.update({
        where: { id: copy.id },
        data: { status: "AVAILABLE" },
      }),
    ]);
  }

  await prisma.$transaction([
    prisma.circulation.update({
      where: { id: isIssued.id },
      data: { returnDate: new Date() },
    }),
    prisma.bookCopy.update({
      where: { id: copy.id },
      data: { status: "AVAILABLE" },
    }),
    prisma.institution.update({
      where: {
        id: req.user.institutionId
      },
      data: {
        tokens: {
          decrement: 10
        }
      }
    })
  ]);

  const book = await prisma.book.findFirst({ where: { id: copy.bookId } });

  res.status(200).send(
    `${student.firstName} ${student.lastName}, you have successfully returned '${book.title}' by ${book.author}, published by ${book.publisher}, code: ${copy.code}, call number: ${book.callNo} to ${librarian.firstName} ${librarian.lastName}. On ${new Date().toLocaleString()}`
  );
});

router.post("/lend", circulationPricing, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let copy = await prisma.bookCopy.findFirst({
    where: { id: req.body.copyId, libraryId: req.user.libraryId },
  });
  if (!copy)
    return res
      .status(400)
      .send(
        `Copy with ID: ${req.body.copyId} does not exist, add it to to your Library.`
      );

  let isAvailable = await prisma.bookCopy.findFirst({
    where: {
      id: req.body.copyId,
      status: "AVAILABLE",
      libraryId: req.user.libraryId,
    },
  });
  if (!isAvailable)
    return res.status(400).send(`Book is ${copy.status}, not accessible!`);

  const user = await prisma.member.findUnique({
    where: { email: req.body.email },
  });
  if (!user)
    return res.status(400).send(`User with Email: ${req.body.email} not found`);

  const librarian = await prisma.librarian.findUnique({
    where: { librarianId: req.user.librarianId },
  });
  if (!librarian)
    return res.status(404).send(`Librarian ${req.body.librarianId} not found`);

  await prisma.$transaction([
    prisma.circulation.create({
      data: {
        copyId: isAvailable.id,
        userId: user.id,
        librarianIdNo: librarian.librarianId,
        dueDate: req.body.dueDate,
        libraryId: req.user.librarianId,
      },
    }),

    prisma.bookCopy.update({
      where: { id: isIssued.id },
      data: {
        status: "CHECKEDOUT",
      },
    }),

    prisma.institution.update({
      where: {
        id: req.user.institutionId
      }
    })
  ]);
  let book = await prisma.book.findFirst({ where: { id: copy.bookId } });

  res
    .status(200)
    .send(
      `${librarian.firstName} ${librarian.lastName} you have lent '${book.title
      }' with author: ${book.author}, publisher: ${book.publisher}, code: ${copy.code
      }, call number: ${book.callNo} to ${userId.firstName} ${userId.lastName
      }. On ${now()}`
    );
});

router.post("/return", async (req, res) => {
  const { error } = validateReturn(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const isIssued = await prisma.circulation.findFirst({
    where: {
      AND: [{ copyId: req.body.copyId }, { returnDate: null }],
    },
  });
  if (!isIssued)
    return res.status(400).send("Book is not issued, please lend it!");

  const librarian = await prisma.librarian.findUnique({
    where: { librarianId: req.user.librarianId },
  });
  if (!librarian) return res.status(404).send("Librarian not found!");

  const user = await prisma.member.findFirst({
    where: { email: req.body.email },
  });

  if (!user)
    return res
      .status(400)
      .send(`User with email ${req.body.email} doesn't exist, create one.`);

  const userInCirculation = await prisma.circulation.findFirst({
    where: { userId: user.id },
  });
  if (!userInCirculation)
    return res.status(404).send("User not found or didn't borrow!");

  await prisma.$transaction([
    prisma.circulation.update({
      where: { id: isIssued.id },
      data: {
        returnDate: new Date(),
      },
    }),

    prisma.bookCopy.update({
      where: { id: req.body.copyId },
      data: {
        status: "AVAILABLE",
      },
    }),
  ]);

  let copy = await prisma.bookCopy.findFirst({
    where: { id: isIssued.copyId },
  });
  let book = await prisma.book.findFirst({ where: { id: copy.bookId } });

  let member = await prisma.member.findUnique({
    where: { id: req.body.userId },
  });
  res
    .status(200)
    .send(
      `${member.firstName} ${member.lastName
      }, you have successfully returned '${book.title}' with author: ${book.author
      }, publisher: ${book.publisher}, code: ${copy.code}, call number: ${book.callNo
      } to ${librarian.firstName} ${librarian.lastName}. On ${now()}`
    );
});

router.post("/approve/:id", async (req, res) => {
  const { error } = validateApproval(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let isPending = await prisma.bookRequest.findFirst({
    where: { id: req.params.id },
  });
  if (!isPending)
    return res
      .status(400)
      .send(`The book request with ID: ${req.params.id} doesn't exist!`);

  const librarian = await prisma.librarian.findFirst({
    where: { librarianId: req.user.librarianId },
  });
  if (!librarian)
    return res.status(404).send(`Librarian ${req.user.librarianId} not found`);

  if (req.user.plan === 'Plus') {
    await prisma.$transaction([
      prisma.circulation.create({
        data: {
          copyId: isPending.copyId,
          userId: isPending.userId,
          librarianIdNo: req.user.librarianId,
          libraryId: req.user.libraryId,
          dueDate: req.body.dueDate,
        },
      }),

      prisma.bookCopy.update({
        where: { id: isPending.copyId },
        data: {
          status: "CHECKEDOUT",
        },
      }),
    ]);
  }

  await prisma.$transaction([
    prisma.circulation.create({
      data: {
        copyId: isPending.copyId,
        userId: isPending.userId,
        librarianIdNo: req.user.librarianId,
        libraryId: req.user.libraryId,
        dueDate: req.body.dueDate,
      },
    }),

    prisma.bookCopy.update({
      where: { id: isPending.copyId },
      data: {
        status: "CHECKEDOUT",
      },
    }),
    prisma.institution.update({
      where: {
        id: req.user.institutionId
      },
      data: {
        tokens: {
          decrement: 10
        }
      }
    })
  ]);

  res
    .status(200)
    .send(
      `Book Copy with ID: ${isPending.copyId} successfully approved by librarian!`
    );
});

router.put("/reject/:id", async (req, res) => {
  const isPending = await prisma.bookRequest.findFirst({
    where: { id: req.params.id, status: "PENDING" },
  });
  if (!isPending)
    return res
      .status(400)
      .send(`This book copy is ${isPending.status}, try again!`);

  await prisma.$transaction([
    prisma.bookRequest.update({
      where: { id: req.params.id },
      data: { status: "REJECTED" },
    }),
    prisma.bookCopy.update({
      where: { id: isPending.copyId },
      data: { status: "AVAILABLE" },
    }),
  ]);

  res
    .status(200)
    .send(`Book copy with ID: ${isPending.id} has been rejected successfully!`);
});

router.put('/renew/student', circulationPricing, async (req, res) => {
  const { libraryId } = req.user;

  const { error } = validateStudentRenew(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const copy = await prisma.bookCopy.findFirst({ where: { code: req.body.code, libraryId, status: 'CHECKEDOUT' } });
  if (!copy) return res.status(400).send(`There is no Checked out book copy in your library with the given code`);

  const isRenewable = await prisma.circulation.findFirst({ where: { libraryId, copyId: copy.id } });
  if (!isRenewable) return res.status(400).send(`Can't renew the circulation!`);

  if (req.user.plan === 'Plus') {
    await prisma.$transaction([
      prisma.circulation.update({ where: { id: isRenewable.id }, data: { dueDate: new Date(req.body.dueDate) } })
    ]);
  }

  await prisma.$transaction([
    prisma.institution.update({ where: { id: req.user.institutionId }, data: { tokens: { decrement: 10 } } }),
    prisma.circulation.update({ where: { id: isRenewable.id }, data: { dueDate: new Date(req.body.dueDate) } })
  ]);
  res.status(200).send(`The book copy with code: ${copy.code} is renewed successfully and will be returned on ${new Date(req.body.dueDate).toLocaleDateString()}`);

});

router.put("/renew/:id", async (req, res) => {
  let isPending = await prisma.circulation.findFirst({
    where: { id: req.params.id, returnDate: null },
  });
  if (!isPending)
    return res
      .status(400)
      .send(`The circulation is already closed or doesn't exist!`);

  let institution = await prisma.institution.findFirst({
    where: { id: req.user.id },
  });
  const limit = institution.settings.circulation.maxLoanPeriod;
  const dueDate = isPending.dueDate;
  dueDate.setDate(dueDate.getDate() + limit);

  await prisma.circulation.update({
    where: { id: req.params.id },
    data: { dueDate: dueDate },
  });

  res.status(200).send(`Book renewed successfully`);
});

function validate(borrow) {
  const schema = Joi.object({
    copyId: Joi.string().required(),
    email: Joi.string().email().required(),
    dueDate: Joi.date().iso().required(),
  });

  return schema.validate(borrow);
}

function validateReturn(returnData) {
  const schema = Joi.object({
    copyId: Joi.string().required(),
    email: Joi.string().email().required(),
  });
  return schema.validate(returnData);
}

function validateStudentBorrow(body) {
  const schema = Joi.object({
    code: Joi.string().min(3).required(),
    studentCode: Joi.string().required(),
    dueDate: Joi.date().required(),
    comment: Joi.string().min(3).max(250)
  });

  return schema.validate(body);
}

function validateStudentReturn(body) {
  const schema = Joi.object({
    code: Joi.string().min(3).required(),
    studentCode: Joi.string().required(),
  });

  return schema.validate(body);
}

function validateStudentRenew(body) {
  const schema = Joi.object({
    code: Joi.string().min(3).required(),
    dueDate: Joi.date().required(),
  });

  return schema.validate(body);
}

function validateApproval(body) {
  const schema = Joi.object({
    dueDate: Joi.date().required(),
  });

  return schema.validate(body);
}

module.exports = router;
