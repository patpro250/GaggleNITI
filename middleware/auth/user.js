const jwt = require("jsonwebtoken")
const dotenv = require("dotenv");
dotenv.config();

module.exports = function (req, res, next) {
    if (req.path.startsWith('/auth')) return next();
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access denied. No token provided');

    try {
        const payload = jwt.verify(token, process.env.JWT_KEY);
        req.member = payload;
        next();
    } catch (ex) {
        res.status(400).send('Invalid token');
    }
}