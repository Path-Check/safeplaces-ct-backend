const server = require('src/server')
const fs = require('fs')

class API {
  constructor() {
    fs.readdirSync('app/api/').forEach(file => {
      require(`app/api/${file}`)
    })
  }

  start(port) {
    return server.start(port)
  }
}

module.exports = new API()