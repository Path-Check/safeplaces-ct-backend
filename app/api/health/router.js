const server = require('../../../src/server');
const controller = require('./controller');

server.get(
  '/health',
  server.wrapAsync(async (req, res) => await controller.health(req, res)),
);

server.get(
  '/health/slow',
  server.wrapAsync(async (req, res) => await controller.healthSlow(req, res)),
);

server.get(
  '/health/error',
  server.wrapAsync(async (req, res) => await controller.healthError(req, res)),
);
