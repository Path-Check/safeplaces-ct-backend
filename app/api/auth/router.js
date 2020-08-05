const { router } = require('../../../app');
const controller = require('./controller');

/**
 * Authentication API
 */
router.post('/auth/login', controller.login);
router.get('/auth/logout', controller.logout);

/**
 * Multi-factory Authentication API
 */
router.post('/auth/mfa/enroll', controller.mfa.enroll);
router.post('/auth/mfa/challenge', controller.mfa.challenge);
router.post('/auth/mfa/verify', controller.mfa.verify);

router.get(
  '/auth/users/reflect',
  router.wrapAsync(
    async (req, res, next) => await controller.users.reflect(req, res, next),
    true,
  ),
);

if (process.env.AUTH0_MANAGEMENT_ENABLED === 'true') {
  router.post('/auth/register', controller.users.register);

  /**
   * User Management API
   */
  router.post(
    '/auth/users/list',
    router.wrapAsync(
      async (req, res, next) => await controller.users.list(req, res, next),
      true,
    ),
  );
  router.post(
    '/auth/users/get',
    router.wrapAsync(
      async (req, res, next) => await controller.users.get(req, res, next),
      true,
    ),
  );
  router.post(
    '/auth/users/delete',
    router.wrapAsync(
      async (req, res, next) => await controller.users.delete(req, res, next),
      true,
    ),
  );
  router.post(
    '/auth/users/assign-role',
    router.wrapAsync(
      async (req, res, next) =>
        await controller.users.assignRole(req, res, next),
      true,
    ),
  );
  router.post(
    '/auth/users/create',
    router.wrapAsync(
      async (req, res, next) => await controller.users.create(req, res, next),
      true,
    ),
  );
}
