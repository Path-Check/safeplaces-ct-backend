const { server } = require('src');
const controller = require('./controller');

server.post('/health', server.wrapAsync(async (req, res) => await controller.health(req, res)))