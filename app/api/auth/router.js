const server = require('../../../src/server');
const controller = require('./controller');

/**
 * Log in
 */
server.post('/auth/login', controller.login);

/**
 * Log out
 */
server.get('/auth/logout', controller.logout);
