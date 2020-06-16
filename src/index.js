const api = require('./api');
const logger = require('./logger');
const server = require('./server');

class Server {
  get api() {
    return api;
  }

  get logger() {
    return logger;
  }

  get server() {
    return server;
  }
}

module.exports = new Server();
