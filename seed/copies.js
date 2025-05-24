const { faker } = require("@faker-js/faker");
const prisma = require("../routes/prismaClient");

async function seedBookCopies() {
    console.log("📦 Seeding book copies...");

    try {
        const institutions = await prisma.institution.findMany({
            select: {
                id: true,
                library: {
                    where: { name: "Main library" },
                    select: { id: true },
                    take: 1,
                },
            },
        });

        for (const institution of institutions) {
            const libraryId = institution.library[0]?.id;

            if (!libraryId) {
                console.warn(`⚠️ No library found for institution ID: ${institution.id}`);
                continue;
            }

            const books = await prisma.book.findMany({
                where: { institutionId: institution.id },
                select: { id: true },
            });

            for (const book of books) {
                const numberOfCopies = faker.number.int({ min: 1, max: 5 });

                const copies = Array.from({ length: numberOfCopies }).map(() => ({
                    bookId: book.id,
                    libraryId: libraryId,
                    condition: faker.helpers.arrayElement(["NEW", "GOOD", "DAMAGED", "OLD"]),
                    status: faker.helpers.arrayElement([
                        "AVAILABLE",
                        "CHECKEDOUT",
                        "REFERENCEONLY",
                        "ONDISPLAY",
                        "MISSING",
                    ]),
                    dateOfAcquisition: faker.date.recent({ days: 365 }),
                    code: faker.helpers.maybe(() => `BC-${faker.string.alphanumeric(6).toUpperCase()}`),
                    barCode: faker.helpers.maybe(() => faker.string.numeric(12)),
                    callNo: faker.helpers.maybe(() => `Call-${faker.string.alphanumeric(8).toUpperCase()}`),
                }));

                await prisma.bookCopy.createMany({ data: copies });
            }

            console.log(`✅ Seeded copies for books in institution: ${institution.id}`);
        }

        console.log("🎉 Done seeding book copies.");
    } catch (error) {
        console.error("❌ Error seeding book copies:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedBookCopies();
