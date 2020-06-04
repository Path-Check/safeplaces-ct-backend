const server = require('../../../src/server');
const controller = require('./controller');

server.post(
  '/access-code',
  server.wrapAsync(
    async (req, res) => await controller.generate(req, res),
    true,
  ),
);
