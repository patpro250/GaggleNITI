const prisma = require('../routes/prismaClient');

module.exports = async function (req, res, next) {
    const { institutionId } = req.user;
    const institution = await prisma.institution.findFirst({ where: { id: institutionId }, select: { tokens: true } });
    if (!institution) return res.status(404).send(`The institution is not found, that's all we know!`);

    const { tokens } = institution;
    if (tokens < 5) return res.status(400).send(`You are out of tokens, consider upgrading to a plan!`);
    next();
}