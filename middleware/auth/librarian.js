module.exports = async function (req, res, next) {
    if (!req.user || !req.user.librarianId) return res.status(403).send('This action can be done by Librarian only.');
    next();
}