const server = require('../../../src/server');
const passport = require('../../../src/server/passport');
const controller = require('./controller');

server.post(
  '/login',
  passport.authenticate('ldap'),
  controller.login,
);

server.get(
  '/auth/login',
  controller.authLogin,
);

server.get(
  '/auth/logout',
  controller.authLogout,
);

server.get(
  '/auth/callback',
  controller.authCallback,
);
