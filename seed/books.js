const { faker } = require("@faker-js/faker");
const prisma = require("../routes/prismaClient");

async function seedBooks() {
  console.log("📚 Seeding books...");

  const books = Array.from({ length: 10 }).map(() => ({
    title: faker.lorem.words({ min: 2, max: 5 }),
    author: faker.person.fullName(),
    publisher: faker.company.name(),
    published: faker.date.past({ years: 20 }),
    firstAcquisition: faker.date.recent({ days: 365 }),
    isbn: faker.helpers.maybe(() => faker.string.numeric(13), {
      probability: 0.9,
    }),
    language: faker.helpers.arrayElement(["en", "es", "fr", "de", "zh"]),
    edition: faker.helpers.maybe(
      () => `${faker.number.int({ min: 1, max: 10 })}th Edition`
    ),
    numberOfPages: faker.number.int({ min: 100, max: 1000 }),
    shelfLocation: `Shelf-${faker.string.alphanumeric(5).toUpperCase()}`,
    callNo: faker.helpers.maybe(
      () => `Call-${faker.string.alphanumeric(8).toUpperCase()}`
    ),
    barCode: faker.helpers.maybe(() => faker.string.numeric(12)),
    ddcCode: faker.helpers.maybe(
      () =>
        `${faker.number.int({ min: 100, max: 999 })}.${faker.number.int({
          min: 1,
          max: 99,
        })}`
    ),
    institutionId: "7cb6fe17-b18b-40a4-a531-fa9da6c67059",
    genre: faker.helpers.maybe(() => faker.music.genre()),
    placeOfPublication: faker.helpers.maybe(() => faker.location.city()),
  }));

  try {
    await prisma.book.createMany({ data: books });
    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  }
}

seedBooks();
