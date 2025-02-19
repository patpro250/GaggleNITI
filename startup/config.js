require("dotenv").config();

module.exports = function () {
    if (!process.env.JWT_KEY) {
        throw new Error(`Can't find the JWT_KEY.`);
    }
}