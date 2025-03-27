const cron = require("node-cron");
const prisma = require("../routes/prismaClient");

module.exports = function () {
  cron.schedule("0 0  * *", async () => {
    console.log("Cron job started: Updating books acquired 30+ days ago.");
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
            condition: "GOOD",
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
};
