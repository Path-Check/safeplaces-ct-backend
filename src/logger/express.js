const logger = require('../logger')

const expressLogger = () => {
  return (req, res, next) => {
    if (req.method === 'OPTIONS') return next()
    if (process.env.NODE_ENV !== 'test') {
      logger.info(`${req.method} - ${req.url}`)
    }
    return next()
  }
}

module.exports = expressLogger