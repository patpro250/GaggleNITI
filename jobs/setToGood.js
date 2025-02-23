const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = function() {

  cron.schedule("25 16 * * *", async () => {
    console.log('Cron job started: Updating books acquired 2+ days ago.');
    try {
      const currentDate = new Date();

      const copiesToUpdate = await prisma.bookCopy.findMany({
        where: {
          dateOfAcquisition: {
            lte: new Date(currentDate.setDate(currentDate.getDate() - 2)),
          },
        },
      });

      if (copiesToUpdate.length > 0) {
        await prisma.bookCopy.updateMany({
          where: {
            id: {
              in: copiesToUpdate.map((book) => book.id),
            },
          },
          data: {
            condition: 'GOOD'
          },
        });

        console.log(`${copiesToUpdate.length} books copies updated.`);
      } else {
        console.log("No book copies to update.");
      }
    } catch (error) {
      console.error("Error during cron job:", error);
    }
  });
}
