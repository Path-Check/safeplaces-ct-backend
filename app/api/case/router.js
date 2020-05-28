// app/api/case/router.js

const server = require('../../../src/server');
const controller = require('./controller');

server.delete(
  '/case',
  server.wrapAsync(async (req, res) => await controller.deleteCase(req, res)),
);

server.get(
  '/case/points',
  server.wrapAsync(async (req, res) => await controller.fetchCasePoints(req, res)),
);

server.post(
  '/case/point',
  server.wrapAsync(async (req, res) => await controller.createCasePoint(req, res)),
);

server.post(
  '/case/consent-to-publishing',
  server.wrapAsync(async (req, res) => await controller.consentToPublish(req, res)),
);

server.post(
  '/case/stage',
  server.wrapAsync(async (req, res) => await controller.setCaseToStaging(req, res)),
);

server.post(
  '/case/publish',
  server.wrapAsync(async (req, res) => await controller.publishCase(req, res)),
);