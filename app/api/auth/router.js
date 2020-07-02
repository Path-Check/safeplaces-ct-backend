const { router } = require('../../../app');
const controller = require('./controller');

/**
 * Log in
 */
router.post('/auth/login', controller.login);

/**
 * Log out
 */
router.get('/auth/logout', controller.logout);
