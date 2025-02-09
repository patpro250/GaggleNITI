const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function seedLibrarians() {
  console.log("🌱 Seeding librarians...");
  let password = await bcrypt.hash('@Gaggle2025', 10);

  const librarians = Array.from({ length: 10 }).map(() => ({
    librarianId: faker.string.uuid(),
    institutionId: faker.datatype.boolean() ? faker.string.uuid() : null,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    status: faker.helpers.arrayElement([
      "ACTIVE",
      "INACTIVE",
      "SUSPENDED",
      "ON_LEAVE",
      "RETIRED",
      "TERMINATED",
      "PENDING",
      "PROBATION",
      "RESIGNED",
      "TRANSFERRED",
      "DECEASED",
    ]),
    gender: faker.helpers.arrayElement(["F", "M", "O"]),
    phoneNumber: faker.phone.number(),
    password: password, 
    role: faker.helpers.arrayElement([
      "DIRECTOR",
      "ASSISTANT",
      "CATALOGER",
      "REFERENCE_LIBRARIAN",
      "CIRCULATION_LIBRARIAN",
      "ARCHIVIST",
      "DIGITAL_LIBRARIAN",
      "SYSTEMS_LIBRARIAN",
      "ACQUISITIONS_LIBRARIAN",
      "YOUTH_LIBRARIAN",
      "LAW_LIBRARIAN",
      "MEDICAL_LIBRARIAN",
      "SCHOOL_LIBRARIAN",
      "PUBLIC_SERVICES_LIBRARIAN",
      "INTERLIBRARY_LOAN_LIBRARIAN",
      "RESEARCH_LIBRARIAN",
      "SERIALS_LIBRARIAN",
      "SPECIAL_COLLECTIONS_LIBRARIAN",
      "TECHNICAL_LIBRARIAN",
      "EVENTS_COORDINATOR",
      "VOLUNTEER_COORDINATOR",
    ]),
    permissions: faker.helpers.arrayElements(
      ["READ", "WRITE", "DELETE", "MANAGE_USERS", "SYSTEM_ADMIN"],
      faker.number.int({ min: 1, max: 3 }) // 1-3 random permissions
    ),
    joined: faker.date.past(),
  }));

  try {
    await prisma.librarian.createMany({ data: librarians });
    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  }
}

seedLibrarians();
