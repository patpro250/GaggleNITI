const winston = require('winston');
const logger = require("../logger");

module.exports = function(err, req, res, next){
    logger.error(err);
    res.status(500).send('Something failed. Our team is reviewing the issue, in few hours, this service will be operational!');
}