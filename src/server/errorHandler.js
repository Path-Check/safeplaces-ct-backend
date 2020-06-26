const logger = require('../logger');

/* eslint-disable */
const errorHandler = () => {
  return (err, req, res, next) => {
    let errorCode = err.statusCode || 500;
    let errorMessage = err.message || 'General error.';
    if (err.isBoom) {
      errorCode = err.output.statusCode;
      errorMessage = err.output.payload.message;
    }

    // make sure error is captured in logs for all environments except test
    if (process.env.NODE_ENV !== 'test') {
      logger.error(`${errorCode} - ${err.stack}`);
    }

    // scrub error returned to client for production environment
    if (process.env.NODE_ENV === 'production') {
      errorMessage = 'Internal server error';
    }

    let response = { message: `${errorCode} - ${errorMessage}` };

    // return full error in response payload if not in production
    if (process.env.NODE_ENV !== 'production') {
      response.error = err;
    }

    res.status(errorCode).json(response);
  };
};

module.exports = errorHandler;
/* eslint-enable */
