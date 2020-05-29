// app/api/point/router.js

const server = require('../../../src/server');
const controller = require('./controller');

server.put(
  '/point',
  server.wrapAsync(async (req, res) => await controller.updatePoint(req, res)),
);

server.delete(
  '/point',
  server.wrapAsync(async (req, res) => await controller.deletePoint(req, res)),
);