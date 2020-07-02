const { router } = require('../../../app');
const controller = require('./controller');

/**
 * Log in
 *
 * DEPRECATED - use "/auth/login" instead.
 */
router.post('/login', controller.login);

/**
 * Log in
 */
router.post('/auth/login', controller.login);

/**
 * Log out
 */
router.get('/auth/logout', controller.logout);
