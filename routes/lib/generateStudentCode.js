const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = async function (firstName, lastName) {
  let uniqueString;
  let exists = true;

  while (exists) {
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    const randomNumber = Math.floor(Math.random() * 1000) + 1;
    uniqueString = `${firstInitial}${lastInitial}${randomNumber}`;

    const existingRecord = await prisma.student.findUnique({where: {code: uniqueString}});
    exists = existingRecord;
  }
  return uniqueString;
};
