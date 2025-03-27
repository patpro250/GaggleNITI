const prisma = require("../routes/prismaClient");

module.exports = async function () {
  try {
    await prisma.$connect();
    console.log("Connected to DataBase 🚀");
  } catch (error) {
    throw error;
  }
};
