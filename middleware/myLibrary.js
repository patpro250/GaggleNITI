const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = async function (req, res, next) {
    if (req.user.role === 'DIRECTOR') {
        let libraryId = await prisma.library.findFirst({where: {directorId: req.user.librarianId}});
        if (!libraryId) return res.status(400).send(`We can't find your library! Try again.`);
        req.user.libraryId = libraryId.id;
        next();
    }
}