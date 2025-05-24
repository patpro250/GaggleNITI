const prisma = require("../routes/prismaClient");

async function seedPurchasesForAllInstitutions() {
    console.log("💳 Seeding subscriptions for institutions...");

    try {
        // Get the cheapest plan
        const cheapestPlan = await prisma.pricingPlan.findFirst({
            orderBy: {
                price: "asc",
            },
            take: 1,
        });

        if (!cheapestPlan) {
            console.error("❌ No pricing plan found!");
            return;
        }

        const institutions = await prisma.institution.findMany({
            select: { id: true },
        });

        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

        for (const institution of institutions) {
            await prisma.purchase.create({
                data: {
                    institutionId: institution.id,
                    planId: cheapestPlan.id,
                    isTrial: true,
                    expiresAt,
                },
            });

            console.log(`✅ Added subscription for institution: ${institution.id}`);
        }

        console.log("🎉 Completed adding subscriptions for all institutions.");
    } catch (error) {
        console.error("❌ Error creating subscriptions:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedPurchasesForAllInstitutions();
