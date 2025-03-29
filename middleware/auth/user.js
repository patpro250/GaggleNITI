const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports = function (req, res, next) {
  if (
    req.path.startsWith("/auth") ||
    (req.path.startsWith("/members") && req.method === "POST") ||
    req.path.startsWith("/suppliers") ||
    (req.path === "/institutions" && req.method === "POST")
  )
    return next();
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided");

  try {
    const payload = jwt.verify(token, process.env.JWT_KEY);
    req.user = payload;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token");
  }
};
