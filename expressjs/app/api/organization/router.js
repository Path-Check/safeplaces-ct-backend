const server = require('../../../src/server');
const controller = require('./controller');

server.get('/organization/:organization_id', server.wrapAsync(async (req, res) => await controller.fetchOrganization(req, res), false));
server.put('/organization/:organization_id', server.wrapAsync(async (req, res) => await controller.updateOrganization(req, res), false));