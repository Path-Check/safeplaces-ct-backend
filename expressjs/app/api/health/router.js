const server = require('src/server')
const controller = require('./controller');

server.post('/health', server.wrapAsync(async (req, res) => await controller.health(req, res)))