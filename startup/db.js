const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = async function () {
  try {
    await prisma.$connect();
    console.log("Connected to DataBase 🚀");
  } catch (error) {
    throw error;
  }
};
