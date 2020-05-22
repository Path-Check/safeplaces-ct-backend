const server = require('../../../src/server');
const controller = require('./controller');

server.get('/organization/:organization_id', server.wrapAsync(async (req, res) => await controller.fetchOrganizationById(req, res), true));
server.put('/organization/:organization_id', server.wrapAsync(async (req, res) => await controller.updateOrganization(req, res), true));