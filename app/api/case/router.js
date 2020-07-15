// app/api/case/router.js

const { router } = require('../../../app');
const controller = require('./controller');

router.post(
  '/case/consent-to-publishing',
  router.wrapAsync(
    async (req, res) => await controller.consentToPublish(req, res),
    true,
  ),
);

router.post(
  '/case/stage',
  router.wrapAsync(
    async (req, res) => await controller.setCaseToStaging(req, res),
    true,
  ),
);

router.post(
  '/cases/publish',
  router.wrapAsync(
    async (req, res) => await controller.publishCases(req, res),
    true,
  ),
);

router.post(
  '/case/delete',
  router.wrapAsync(
    async (req, res) => await controller.deleteCase(req, res),
    true,
  ),
);

router.put(
  '/case',
  router.wrapAsync(
    async (req, res) => await controller.updateOrganizationCase(req, res),
    true,
  ),
);
