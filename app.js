const path = require('path');

const config = {
  port: process.env.PORT || '3000',
  appFolder: path.join(__dirname, 'app'),
  wrapAsync: (asyncFn, validate = false) => {
    return (req, res, next) => {
      if (validate) {
        return enforcer
          .handleRequest(req, res)
          .then(() => asyncFn(req, res, next))
          .catch(next);
      }
      asyncFn(req, res, next).catch(next);
    };
  },
};

const server = require('@pathcheck/safeplaces-server')(config);
const enforcer = require('./app/lib/auth');

server.setupAndCreate();

module.exports = server;
