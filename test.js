const prisma = require("./routes/prismaClient");

prisma.institution.update({ where: { id: '9177e50f-8b7b-4e36-87fe-7a00e91e7183' }, data: { tokens: { decrement: 5 } } });

console.log(`Successfully updated.`)