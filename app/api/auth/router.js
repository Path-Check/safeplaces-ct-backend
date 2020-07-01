const server = require('../../../src/server');
const controller = require('./controller');

/**
 * Log in
 *
 * DEPRECATED - use "/auth/login" instead.
 */
server.post('/login', controller.login);

/**
 * Log in
 */
server.post('/auth/login', controller.login);

/**
 * Log out
 */
server.get('/auth/logout', controller.logout);
