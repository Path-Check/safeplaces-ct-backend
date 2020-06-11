// app/api/case/router.js

const server = require('../../../src/server');
const controller = require('./controller');

server.post(
  '/case/consent-to-publishing',
  server.wrapAsync(async (req, res) => await controller.consentToPublish(req, res), true),
);

server.post(
  '/case/stage',
  server.wrapAsync(async (req, res) => await controller.setCaseToStaging(req, res), true),
);

server.post(
  '/cases/publish',
  server.wrapAsync(async (req, res) => await controller.publishCases(req, res), true),
);

server.post(
  '/case/delete',
  server.wrapAsync(async (req, res) => await controller.deleteCase(req, res), true),
);

server.put(
  '/case',
  server.wrapAsync(async (req, res) => await controller.updateOrganizationCase(req, res), true),
);
