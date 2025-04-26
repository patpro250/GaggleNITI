const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");

const prisma = require("../routes/prismaClient");

async function seedMembers() {
  console.log("Seeding members...");
  let password = await bcrypt.hash("@Gaggle2025", 10);

  const members = Array.from({ length: 10 }).map(() => ({
    id: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    dateOfBirth: faker.date.birthdate({ min: 18, max: 80, mode: "age" }),
    phone: faker.phone.number(),
    gender: faker.helpers.arrayElement(["M", "F", "O"]),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zip: faker.location.zipCode(),
      country: faker.location.country(),
    },
    memberShipType: faker.helpers.arrayElement([
      "STUDENT",
      "REGULAR",
      "SENIOR",
      "PREMIUM",
      "TEMPORARY",
      "LIFETIME",
      "FAMILY",
      "CORPORATE",
      "VIP",
    ]),
    status: faker.helpers.arrayElement([
      "ACTIVE",
      "INACTIVE",
      "PENDING",
      "SUSPENDED",
      "BANNED",
      "EXPIRED",
      "ON_HOLD",
      "DECEASED",
      "BLACKLISTED",
      "PROBATION",
      "GUEST",
      "FROZEN",
    ]),
    profile: {
      bio: faker.lorem.sentence(),
      avatar: faker.image.avatar(),
      interests: faker.lorem.words(3).split(" "),
    },
    joinedAt: faker.date.past(),
    password: password,
  }));

  await prisma.member.createMany({ data: members });

  console.log("Seeding completed successfully!");
}

seedMembers();
