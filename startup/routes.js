const express = require("express");
const error = require("../middleware/error");
const trimmer = require("../middleware/trimmer");
const cors = require("cors");
// const { limiter } = require("../middleware/limiter");
const helmet = require("helmet");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

const home = require("../routes/home");
const analytics = require("../routes/analytics");
const books = require("../routes/books");
const bookCopies = require("../routes/bookCopies");
const institutions = require("../routes/institutions");
const members = require("../routes/members");
const librarians = require("../routes/librarians");
const acquisitions = require("../routes/acquisitions");
const suppliers = require("../routes/suppliers");
const circulations = require("../routes/circulations");
const reservations = require("../routes/reservations");
const interLibrary = require("../routes/interLibrary");
const auth = require("../routes/auth");
const user = require("../middleware/auth/user");
const libraries = require("../routes/libraries");
const students = require("../routes/students");
const catalog = require("../routes/catalogs");
const plans = require("../routes/plans");
const payments = require("../routes/payments");
const purchases = require("../routes/purchases");
const systemAdmin = require("../routes/systemAdmin");
const passwordReset = require("../routes/passwordReset");
const invalidJSON = require("../middleware/invalidJSON");

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:3002",
  "http://localhost:3003",
  "https://lib.gaggleniti.com",
  "https://app.gaggleniti.com",
  "https://gaggleniti.com",
];

module.exports = function (app) {
  // ✅ CORS must come FIRST
  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        } else {
          return callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      exposedHeaders: ["x-auth-token"],
    })
  );

  // ✅ Preflight (OPTIONS) support
  app.options("*", cors());

  app.use(cookieParser());
  app.use(helmet());

  app.use(
    express.json({
      verify: (req, res, buf, encoding) => {
        try {
          JSON.parse(buf.toString(encoding));
        } catch (e) {
          throw new SyntaxError("Invalid JSON");
        }
      },
    })
  );

  app.use(invalidJSON);
  app.use(trimmer);
  // app.use(limiter);
  app.use(hpp());

  app.use("/", home);
  app.use(user);

  app.use("/books", books);
  app.use("/institutions", institutions);
  app.use("/bookcopies", bookCopies);
  app.use("/members", members);
  app.use("/librarians", librarians);
  app.use("/suppliers", suppliers);
  app.use("/acquisitions", acquisitions);
  app.use("/circulations", circulations);
  app.use("/reservations", reservations);
  app.use("/interlibrary", interLibrary);
  app.use("/auth", auth);
  app.use("/libraries", libraries);
  app.use("/students", students);
  app.use("/catalog", catalog);
  app.use("/plans", plans);
  app.use("/payments", payments);
  app.use("/purchases", purchases);
  app.use("/analytics", analytics);
  app.use("/system-admin", systemAdmin);
  app.use("/reset-password", passwordReset);

  app.use(error);
};
