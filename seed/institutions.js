const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");
const prisma = require("../routes/prismaClient");
const institutionSettings = require("../routes/lib/defaultSettings"); // adjust this path if needed

async function seedInstitutions() {
  console.log("🏫 Seeding 100 institutions...");

  const passwordHash = await bcrypt.hash("@Gaggle2025", 10);
  const settings = institutionSettings().settings;

  try {
    for (let i = 0; i < 100; i++) {
      const institution = await prisma.institution.create({
        data: {
          name: faker.company.name() + " School",
          type: "SCHOOL",
          email: faker.internet.email(),
          phone: faker.phone.number(),
          address: faker.location.streetAddress(),
          password: passwordHash,
          settings: settings,
          library: {
            create: {
              name: "Main library",
              shelvesNo: faker.number.int({ min: 10, max: 50 }),
              numberOfSeats: faker.number.int({ min: 20, max: 200 }),
              status: "ACTIVE",
              type: "SCHOOL",
            },
          },
        },
      });

      console.log(`✅ Created institution: ${institution.name}`);
    }

    console.log("🎉 Done seeding 100 institutions with libraries.");
  } catch (error) {
    console.error("❌ Error seeding institutions:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedInstitutions();
