const responseTime = require('response-time')
const logger = require('../logger')

/* eslint-disable */
const responseTimeHandler = () => {
  return responseTime((req, res, time) => {
    if (time <= 1000) return;
    logger.warn(`Slow Response - ${time.toFixed(0)}ms ${req.method} ${req.originalUrl}`);
  });
};

module.exports = responseTimeHandler;
/* eslint-enable */