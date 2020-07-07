// app/api/case/router.js

const { router } = require('../../../app');
const controller = require('./controller');

router.post(
  '/case/points',
  router.wrapAsync(
    async (req, res) => await controller.fetchCasePoints(req, res),
    true,
  ),
);

router.post(
  '/cases/points',
  router.wrapAsync(
    async (req, res) => await controller.fetchCasesPoints(req, res),
    true,
  ),
);

router.post(
  '/case/points/ingest',
  router.wrapAsync(
    async (req, res) => await controller.ingestUploadedPoints(req, res),
    true,
  ),
);

router.post(
  '/case/points/delete',
  router.wrapAsync(
    async (req, res) => await controller.deleteCasePoints(req, res),
    true,
  ),
);

router.post(
  '/case/point',
  router.wrapAsync(
    async (req, res) => await controller.createCasePoint(req, res),
    true,
  ),
);

router.put(
  '/case/point',
  router.wrapAsync(
    async (req, res) => await controller.updateCasePoint(req, res),
    true,
  ),
);

router.put(
  '/case/points',
  router.wrapAsync(
    async (req, res) => await controller.updateCasePoints(req, res),
    true,
  ),
);

router.post(
  '/case/point/delete',
  router.wrapAsync(
    async (req, res) => await controller.deleteCasePoint(req, res),
    true,
  ),
);

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
