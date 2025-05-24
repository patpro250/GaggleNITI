const { faker } = require("@faker-js/faker");
const prisma = require("../routes/prismaClient");

async function seedCatalogs() {
    console.log("📚 Seeding 100 catalogs...");

    const catalogs = Array.from({ length: 100 }).map(() => {
        // Generate a unique ISBN-13 string
        const isbn = faker.string.numeric(13);

        // Generate keywords as array of 3-7 random words
        const keywords = faker.lorem.words(faker.number.int({ min: 3, max: 7 })).split(" ");

        return {
            title: faker.lorem.words(faker.number.int({ min: 2, max: 6 })),
            author: faker.person.fullName(),
            isbn: isbn,
            published: faker.date.past({ years: 30 }),
            publisher: faker.company.name(),
            category: faker.helpers.arrayElement(["Science", "Technology", "Literature", "History", "Art", "Children", "Reference"]),
            language: faker.helpers.arrayElement(["en", "es", "fr", "de", "zh"]),
            description: faker.lorem.paragraph(),
            ddcCode: `${faker.number.int({ min: 100, max: 999 })}.${faker.number.int({ min: 1, max: 99 })}`,
            placeOfPublication: faker.location.city(),
            lccCode: faker.string.alpha({ count: 1 }).toUpperCase() + faker.number.int({ min: 1000, max: 9999 }).toString(),
            callNo: `Call-${faker.string.alphanumeric(8).toUpperCase()}`,
            keywords: keywords,
            format: faker.helpers.arrayElement(["AUDIO", "EBOOK", "HARD_COVER"]),
            edition: faker.helpers.maybe(() => `${faker.number.int({ min: 1, max: 10 })}th Edition`),
            pages: faker.helpers.maybe(() => faker.number.int({ min: 50, max: 1500 })),
            coverImageURL: faker.helpers.maybe(() => faker.image.urlLoremFlickr({ category: "books", width: 200, height: 300 })),
        };
    });

    try {
        await prisma.catalog.createMany({ data: catalogs });
        console.log("✅ Successfully seeded catalogs!");
    } catch (error) {
        console.error("❌ Error seeding catalogs:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedCatalogs();
