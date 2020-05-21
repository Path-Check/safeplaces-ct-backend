const server = require('../../../src/server');
const controller = require('./controller');

server.get('/redacted_trails', server.wrapAsync(async (req, res) => await controller.fetchRedactedTrails(req, res), true));
server.post('/redacted_trail', server.wrapAsync(async (req, res) => await controller.createRedactedTrail(req, res), true));