const express = require("express");
const trimmer = require("../middleware/trimmer");
const books = require("../routes/books");
const bookcopies = require("../routes/bookcopies");
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

module.exports = function (app) {
    app.use(user);
    app.use(express.json());
    app.use(trimmer);
    app.use('/books', books);
    app.use('/institutions', institutions);
    app.use('/bookcopies', bookcopies);
    app.use('/members', members);
    app.use('/librarians', librarians);
    app.use('/suppliers', suppliers);
    app.use('/acquisitions', acquisitions);
    app.use('/circulations', circulations);
    app.use("/reservations", reservations);
    app.use("/interlibrary", interLibrary);
    app.use('/auth', auth);
    app.use('/libraries', libraries);
}
