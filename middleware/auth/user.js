const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports = function (req, res, next) {
  if (
    req.path.startsWith("/auth") ||
    req.path.startsWith("/suppliers") ||
    (req.path.startsWith("/plans") && req.method === "GET" && req.path !== "/plans/current") ||
    (req.path.startsWith("/catalog") && req.method === "GET") ||
    (req.path === "/institutions" && req.method === "POST") ||
    (req.path === "/system-admin" && req.method === "POST")
  ) {
    return next();
  }

  const token = req.cookies?.librarian_token || req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided");

  try {
    const payload = jwt.verify(token, process.env.JWT_KEY);
    req.user = payload;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token");
  }
};
