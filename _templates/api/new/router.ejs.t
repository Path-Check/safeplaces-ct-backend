---
to: app/api/<%= name %>/router.js
---
// app/api/<%= name %>/router.js

const server = require('../../../src/server');
const controller = require('./controller');

server.get(
  '/health',
  server.wrapAsync(async (req, res) => await controller.health(req, res)),
);