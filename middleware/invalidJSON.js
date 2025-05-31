module.exports = function (err, req, res, next) {
    if (err instanceof SyntaxError && err.message.includes("Invalid JSON")) {
        return res.status(400).send("Malformed JSON body");
    }
    next();
}