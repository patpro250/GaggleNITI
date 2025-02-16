const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = async function (req, res, next) {
    if (!req.user || !req.user.librarianId || req.user.status !== 'ACTIVE') {
        return res.status(403).send('This action can be done by an ACTIVE Librarian only.');
    }
    let isInLibrary = await prisma.library.findFirst({where: {directorId: req.user.librarianId}});
    if (!isInLibrary) return res.status(403).send(`You are not allowed to access this library!`)
    next();
};
