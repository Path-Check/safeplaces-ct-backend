const modulePaths = require('app-module-path')

modulePaths.addPath(__dirname)
modulePaths.addPath(`${__dirname}/src/`)
modulePaths.addPath(`${__dirname}/app/`)