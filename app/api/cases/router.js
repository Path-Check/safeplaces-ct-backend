const server = require('../../../src/server');
const controller = require('./controller');

server.post(
  '/cases/publish',
  server.wrapAsync(async (req, res) => await controller.publish(req, res)),
);
