const api = require('./api');
const server = require('./server');

class Server {
  get api() {
    return api;
  }

  get server() {
    return server;
  }
}

module.exports = new Server();
