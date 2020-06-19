const winston = require('winston');
const transports = require('./transports');
const config = require('./config');

const logger = new winston.Logger({
  levels: config.output.levels,
  transports: transports,
});

module.exports = logger;
