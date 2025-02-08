const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = async function (req, res, next) {
    let isLibrarian = await prisma.librarian.findFirst({where: {librarianId: req.user.librarianId}});
    console.log(req.user);
    if (!isLibrarian) return res.status(400).send('This action can be done by Librarian only.');
    next();
}