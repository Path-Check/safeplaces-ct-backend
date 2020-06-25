const server = require('../../../src/server');
const passport = require('../../../src/server/passport');
const controller = require('./controller');

server.post('/login', passport.authenticate('ldap'), controller.login);
server.post('/login/v2', passport.authenticate('cookie'), controller.login);
