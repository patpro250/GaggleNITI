const { faker } = require("@faker-js/faker");
const prisma = require("../routes/prismaClient");

async function seedBooks() {
  console.log("📚 Seeding 100 books per institution...");

  try {
    const institutions = await prisma.institution.findMany({
      select: { id: true },
    });

    for (const institution of institutions) {
      const books = Array.from({ length: 100 }).map(() => ({
        title: faker.lorem.words({ min: 2, max: 5 }),
        author: faker.person.fullName(),
        publisher: faker.company.name(),
        published: faker.helpers.maybe(() => faker.date.past({ years: 20 })),
        firstAcquisition: faker.date.recent({ days: 365 }),
        isbn: faker.helpers.maybe(() => faker.string.numeric(13), { probability: 0.9 }),
        language: faker.helpers.arrayElement(["en", "es", "fr", "de", "zh"]),
        edition: faker.helpers.maybe(() => `${faker.number.int({ min: 1, max: 10 })}th Edition`),
        numberOfPages: faker.number.int({ min: 100, max: 1000 }),
        lccCode: faker.helpers.maybe(() =>
          `${faker.string.alpha(1).toUpperCase()}${faker.number.int({ min: 100, max: 999 })}`
        ),
        ddcCode: faker.helpers.maybe(() =>
          `${faker.number.int({ min: 100, max: 999 })}.${faker.number.int({ min: 0, max: 99 })}`
        ),
        institutionId: institution.id,
        genre: faker.helpers.maybe(() => faker.music.genre()),
        placeOfPublication: faker.helpers.maybe(() => faker.location.city()),
      }));

      await prisma.book.createMany({ data: books });

      console.log(`✅ Added 100 books for institution ID: ${institution.id}`);
    }

    console.log("🎉 Done seeding books for all institutions.");
  } catch (error) {
    console.error("❌ Error seeding books:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBooks();
