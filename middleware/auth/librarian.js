module.exports = async function (req, res, next) {
    if (!req.user || (!req.user.librarianId && (req.user.status === 'ACTIVE'))) return res.status(403).send('This action can be done by an ACTIVE Librarian only.');
    next();
}