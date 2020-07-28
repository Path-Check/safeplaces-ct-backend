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

/**
 * List users
 */
router.post(
  '/auth/users/list',
  router.wrapAsync(
    async (req, res) => await controller.users.list(req, res),
    true,
  ),
);

/**
 * Get user
 */
router.post(
  '/auth/users/get',
  router.wrapAsync(
    async (req, res) => await controller.users.get(req, res),
    true,
  ),
);

/**
 * Delete user
 */
router.post(
  '/auth/users/delete',
  router.wrapAsync(
    async (req, res) => await controller.users.delete(req, res),
    true,
  ),
);

/**
 * Update user
 */
router.post(
  '/auth/users/update',
  router.wrapAsync(
    async (req, res) => await controller.users.update(req, res),
    true,
  ),
);

/**
 * Update user
 */
router.post(
  '/auth/users/assign-role',
  router.wrapAsync(
    async (req, res) => await controller.users.assignRole(req, res),
    true,
  ),
);

/**
 * Create user
 */
router.post(
  '/auth/users/create',
  router.wrapAsync(
    async (req, res) => await controller.users.create(req, res),
    true,
  ),
);

/**
 * Send password reset email
 */
router.post(
  '/auth/users/reset-password',
  router.wrapAsync(
    async (req, res) => await controller.users.resetPassword(req, res),
    false,
  ),
);

/**
 * Do nothing
 */
router.get(
  '/auth/users/reflect',
  router.wrapAsync(
    async (req, res) => await controller.users.reflect(req, res),
    true,
  ),
);
