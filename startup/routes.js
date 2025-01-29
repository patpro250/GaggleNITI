const express = require("express");
const books = require("../routes/books");
const bookcopies = require("../routes/bookcopies");
const institutions = require("../routes/institutions");
const members = require("../routes/members");

module.exports = function (app) {
    app.use(express.json());
    app.use('/books', books);
    app.use('/institutions', institutions);
    app.use('/bookcopies', bookcopies);
    app.use('/members', members);
}
