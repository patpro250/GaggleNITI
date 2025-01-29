const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { faker } = require("@faker-js/faker");

async function users() {
    const institutions = Array.from({ length: 100 }, () => ({
        name: faker.company.name(),
        address: faker.location.streetAddress(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
}));
    try {
        await prisma.institution.createMany({data: institutions});
        console.log('✅ Successfully inserted 100 institutions');
    } catch (error) {
        console.error('❌ Error inserting institutions:', error);
    }
}

users();
