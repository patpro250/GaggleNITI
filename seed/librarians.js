const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");
const prisma = require("../routes/prismaClient");

async function seedLibrarians() {
  console.log("🌱 Seeding one librarian per institution...");

  const passwordHash = await bcrypt.hash("@Gaggle2025", 10);

  try {
    const institutions = await prisma.institution.findMany({
      select: { id: true },
    });

    const librarians = [];

    for (const institution of institutions) {
      const library = await prisma.library.findFirst({
        where: {
          institutionId: institution.id,
          name: "Main library",
        },
        select: { id: true },
      });

      if (!library) {
        console.warn(`⚠️ No 'Main library' found for institution ID: ${institution.id}`);
        continue;
      }

      librarians.push({
        institutionId: institution.id,
        libraryId: library.id,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        status: "ACTIVE",
        gender: faker.helpers.arrayElement(["F", "M", "O"]),
        phone: faker.phone.number(),
        password: passwordHash,
        role: 'DIRECTOR',
        permissions: faker.helpers.arrayElements(
          ["READ", "WRITE", "DELETE", "MANAGE_USERS", "SYSTEM_ADMIN", "UPDATE"],
          faker.number.int({ min: 1, max: 3 })
        ),
      });
    }

    await prisma.librarian.createMany({ data: librarians });
    console.log(`✅ Inserted ${librarians.length} librarians (one per institution).`);
  } catch (error) {
    console.error("❌ Error seeding librarians:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedLibrarians();
