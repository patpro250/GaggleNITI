const { faker } = require("@faker-js/faker");
const prisma = require("../routes/prismaClient");

async function seedStudents() {
    console.log("🎓 Seeding random students per institution...");

    try {
        const institutions = await prisma.institution.findMany({
            select: { id: true },
        });

        for (const institution of institutions) {
            const numStudents = faker.number.int({ min: 50, max: 150 }); // customize how many per institution
            const codes = new Set();
            const students = [];

            for (let i = 0; i < numStudents; i++) {
                let code;
                // Ensure unique code per institution
                do {
                    code = `STU-${faker.string.alphanumeric({ length: 6 }).toUpperCase()}`;
                } while (codes.has(code));
                codes.add(code);

                students.push({
                    code,
                    firstName: faker.person.firstName(),
                    lastName: faker.person.lastName(),
                    parentPhone: faker.phone.number(),
                    className: faker.helpers.arrayElement(["Grade 1", "Grade 2", "Grade 3", "JSS 1", "SSS 2"]),
                    status: "ACTIVE",
                    institutionId: institution.id,
                    email: faker.internet.email(),
                    studentCard: faker.datatype.boolean() ? faker.string.uuid() : null,
                });
            }

            await prisma.student.createMany({
                data: students,
            });

            console.log(`✅ Seeded ${students.length} students in institution: ${institution.id}`);
        }

        console.log("🎉 Done seeding students in all institutions.");
    } catch (error) {
        console.error("❌ Error seeding students:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedStudents();
