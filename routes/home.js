const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).send({
        message: "Welcome to the API",
        version: "1.0.0",
        producedBy: "Gaggle NITI Group",
        contact: {
            name: "Gaggle NITI Support",
            email: "nzabonerwanayo@gmail.com"
        }
    })
});

module.exports = router;