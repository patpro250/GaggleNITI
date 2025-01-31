const express = require("express");
const books = require("../routes/books");
const bookcopies = require("../routes/bookcopies");
const institutions = require("../routes/institutions");
const members = require("../routes/members");
const librarians = require("../routes/librarians");
const acquisitions = require("../routes/acquisitions");
const suppliers = require("../routes/supplier");

module.exports = function (app) {
    app.use(express.json());
    app.use('/books', books);
    app.use('/institutions', institutions);
    app.use('/bookcopies', bookcopies);
    app.use('/members', members);
    app.use('/librarians', librarians);
    app.use('/suppliers', suppliers);
    app.use('/acquisitions', acquisitions);
}
