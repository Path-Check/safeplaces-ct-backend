const server = require('src/server')
const controller = require('./controller');

server.get('/safe_path/:organization_id', server.wrapAsync(async (req, res) => await controller.fetchSafePaths(req, res)))
server.post('/safe_paths/', server.wrapAsync(async (req, res) => await controller.createSafePath(req, res), true))