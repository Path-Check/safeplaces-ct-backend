const server = require('../../../src/server');
const controller = require('./controller');

server.get(
  '/organization',
  server.wrapAsync(
    async (req, res) => await controller.fetchOrganizationById(req, res),
    true,
  ),
);
server.get(
  '/organization/configuration',
  server.wrapAsync(
    async (req, res) => await controller.fetchOrganizationConfig(req, res),
    true,
  ),
);
server.put(
  '/organization/configuration',
  server.wrapAsync(
    async (req, res) => await controller.updateOrganization(req, res),
    true,
  ),
);

// Cases

server.post(
  '/organization/case',
  server.wrapAsync(
    async (req, res) => await controller.createOrganizationCase(req, res),
    true,
  ),
);

server.get(
  '/organization/cases',
  server.wrapAsync(
    async (req, res) => await controller.fetchOrganizationCases(req, res),
    true,
  ),
);
