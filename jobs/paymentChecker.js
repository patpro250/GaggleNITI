const cron = require("node-cron");
const prisma = require("../routes/prismaClient");

module.exports = function () {
  // Runs every day at 12:10 p.m.
  cron.schedule("10 12 * * *", async () => {
    const now = new Date();

    try {
      const result = await prisma.purchase.updateMany({
        where: {
          expiresAt: { lt: now },
          status: "ACTIVE",
        },
        data: {
          status: "INACTIVE",
        },
      });
      console.log(
        `[CRON] Updated ${result.count} expired purchases to INACTIVE`
      );
    } catch (err) {
      console.error("[CRON] Failed to update purchases:", err);
    }
  });
  console.log(
    `[CRON] Purchase status checker is running every day at 12:10 p.m.`
  );
};
