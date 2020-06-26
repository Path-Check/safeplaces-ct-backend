const prod = require('./prod');
const test = require('./test');
const { verifyRequest } = require('./common');

module.exports = {
  verifyRequest,
  prod,
  test,
};
