const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Runs every day at midnight
cron.schedule("0 0 * * *", async () => {
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
    console.log(`[CRON] Updated ${result.count} expired purchases to INACTIVE`);
  } catch (err) {
    console.error("[CRON] Failed to update purchases:", err);
  }
});