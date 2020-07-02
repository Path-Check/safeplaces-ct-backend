const { router } = require('../../../app');
const controller = require('./controller');

router.get(
  '/organization',
  router.wrapAsync(
    async (req, res) => await controller.fetchOrganizationById(req, res),
    true,
  ),
);
router.get(
  '/organization/configuration',
  router.wrapAsync(
    async (req, res) => await controller.fetchOrganizationConfig(req, res),
    true,
  ),
);
router.put(
  '/organization/configuration',
  router.wrapAsync(
    async (req, res) => await controller.updateOrganization(req, res),
    true,
  ),
);

// Cases

router.post(
  '/organization/case',
  router.wrapAsync(
    async (req, res) => await controller.createOrganizationCase(req, res),
    true,
  ),
);

router.get(
  '/organization/cases',
  router.wrapAsync(
    async (req, res) => await controller.fetchOrganizationCases(req, res),
    true,
  ),
);
