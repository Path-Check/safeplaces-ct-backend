const path = require('path');
const guard = require('./app/lib/auth');

const config = {
  port: process.env.EXPRESS_PORT || '3000',
  bind: '127.0.0.1',
  appFolder: path.join(__dirname, 'app'),
  wrapAsync: (asyncFn, validate = false) => {
    return (req, res, next) => {
      if (validate) {
        return guard
          .handleReq(req, res, () => asyncFn(req, res, next))
          .catch(next);
      }
      asyncFn(req, res, next).catch(next);
    };
  },
};

const server = require('@pathcheck/safeplaces-server')(config);
server.setupAndCreate();

module.exports = server;
