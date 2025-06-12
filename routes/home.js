const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).send({
        message: "Welcome to the API",
        version: "1.0.0",
        producedBy: "GaggleNITI Group",
        contact: {
            name: "GaggleNITI Support",
            email: "gaggleniti@gmail.com"
        },
        description: "NitiBook is a centralized library management system designed to help users manage their book collections efficiently. It provides features for adding, updating, deleting, and searching for books, as well as managing user accounts and roles.",
    })
});

module.exports = router;