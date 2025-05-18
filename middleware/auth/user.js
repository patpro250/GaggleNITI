const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const openRoutes = [
  { path: "/auth" },
  { path: "/institutions/verify" },
  { path: "/suppliers" },
  { path: "/plans", methods: ["GET"], exclude: ["/plans/current"] },
  { path: "/catalog", methods: ["GET", "POST"] },
  { path: "/institutions", methods: ["POST"] },
  { path: "/system-admin", methods: ["POST"] },
  { path: "/librarians/create", methods: ["POST"] },
];

function isOpenRoute(req) {
  return openRoutes.some((route) => {
    if (!req.path.startsWith(route.path)) return false;
    if (route.methods && !route.methods.includes(req.method)) return false;

    if (route.exclude && route.exclude.includes(req.path)) return false;

    return true;
  });
}

module.exports = function (req, res, next) {
  if (isOpenRoute(req)) {
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
