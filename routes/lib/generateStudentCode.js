const prisma = require("../prismaClient");

module.exports = async function (firstName, lastName, institutionId) {
  let uniqueString;
  let exists = true;

  while (exists) {
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    const randomNumber = Math.floor(Math.random() * 1000) + 1;
    uniqueString = `${firstInitial}${lastInitial}${randomNumber}`;

    const existingRecord = await prisma.student.findFirst({
      where: { code: uniqueString, institutionId },
    });
    exists = existingRecord;
  }
  return uniqueString;
};
