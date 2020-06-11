const winston = require('winston')
const { Papertrail } = require('winston-papertrail')
const config = require('./config')

const hostname = process.env.PAPERTRAIL_HOSTNAME || 'safe-places'
const program = process.env.PAPERTRAIL_PROGRAM || 'default'

winston.addColors(config.output.colors)

const consoleLogger = new winston.transports.Console(config.output)

let transports = []

if (process.env.PAPERTRAIL_URI && process.env.PAPERTRAIL_PORT) {
  if (['local','test'].indexOf(process.env.NODE_ENV) < 0) {

    const params = {
      host: process.env.PAPERTRAIL_URI,
      port: Number(process.env.PAPERTRAIL_PORT),
      hostname: hostname,
      program: program,
      colorize: true
    }
  
    const ptTransport = new Papertrail(params)
    
    transports.push(ptTransport)
  }
}

transports.push(consoleLogger)

module.exports = transports