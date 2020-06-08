/* eslint-disable */

module.exports = function (err, req, res, next) {
  let errorCode = err.statusCode || 500;
  let errorMessage = err.message || 'General error.';

  let response = { message: `${errorCode} - ${errorMessage}` };
  if (process.env.NODE_ENV !== 'production') {
    response.error = err;
  }

  res.status(errorCode).json(response);
};
/* eslint-enable */
