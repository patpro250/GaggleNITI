const express = require("express");
const error = require("../middleware/error");
const trimmer = require("../middleware/trimmer");
const cors = require("cors");
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

module.exports = function (app) {
  // app.use(user);
  app.use(
    cors({
      origin: "http://localhost:3002", // cyangwa aho frontend yawe iri
      exposedHeaders: ["x-auth-token"],
    })
  );
  app.use(express.json());
  app.use(trimmer);
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
  app.use(error);
};
