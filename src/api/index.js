const server = require('../server');
const fs = require('fs');
const path = require('path');

class API {
  constructor() {
    const appPath = path.join(__dirname, '../../app/api');
    fs.readdirSync(appPath).forEach(file => {
      require(`${appPath}/${file}`);
    });
  }

  start(port) {
    return server.start(port);
  }
}

module.exports = new API();
