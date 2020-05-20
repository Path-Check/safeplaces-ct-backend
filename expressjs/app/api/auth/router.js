const server = require('src/server')
const controller = require('./controller');

server.post('/login', server.wrapAsync(async (req, res) => await controller.login(req, res)))