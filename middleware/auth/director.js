module.exports = async function (req, res, next) {
    if (!req.user || !req.user.type || (req.user.status === 'CLOSED')) return res.status(403).send('This action can be done by an ACTIVE Institution only.');
    next();
}