const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    await prisma.aquisition.create({
        data: {
          book: "98dbc6e1-6ffb-4b9a-a174-3540c53d27a3",
          quantity: 2,
          librarian: "1bfb48b1-3bab-4e33-b5eb-6c4638c1abbb",
          doneOn: new Date("2023-08-19T16:17:55.000Z"),
          insititution: "your-institution-id", 
          supplier: "0262f0d5-6cee-42bf-9ae6-91a22ac37681",
          book: {
            connect: { id: "98dbc6e1-6ffb-4b9a-a174-3540c53d27a3" } 
          },
          insititution: {
            connect: { id: "003cc3dd-7db6-4eb8-bcf0-6a407cc95fab" } 
          },
          librarian: {
            connect: { librarianId: "1bfb48b1-3bab-4e33-b5eb-6c4638c1abbb" } 
          },
          supplier: {
            connect: { id: "0262f0d5-6cee-42bf-9ae6-91a22ac37681" } 
          }
        }
      });
      
    console.log('Done');
}

main();