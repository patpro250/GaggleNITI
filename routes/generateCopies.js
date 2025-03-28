const prisma = require("./prismaClient");

async function generate(data) {
  let copies = [];
  let rounds = data.quantity;

  for (let i = 1; i <= rounds; i++) {
    let code = `${i}/${rounds}/${data.code}`;

    const existingCopy = await prisma.bookCopy.findUnique({
      where: { code, libraryId: data.libraryId },
    });

    if (!existingCopy) {
      copies.push({
        bookId: data.bookId,
        libraryId: data.libraryId,
        code: code,
        dateOfAcquisition: data.dateOfAcquisition,
      });
    }
  }

  return copies;
}

module.exports = generate;
