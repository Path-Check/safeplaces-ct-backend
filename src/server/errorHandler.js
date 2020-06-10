const logger = require('../logger')

/* eslint-disable */
const errorHandler = () => {
  return (err, req, res, next) => {
    let errorCode = err.statusCode || 500
    let errorMessage = err.message || 'General error.'
    if (err.isBoom) {
      errorCode = err.output.statusCode
      errorMessage = err.output.payload.message
    }

    let response = { message: `${errorCode} - ${errorMessage}` }
    if (process.env.NODE_ENV !== 'production') {
      response.error = err
      if (process.env.NODE_ENV !== 'test' && err.stack) {
        console.error('')
        console.error(err.stack)
        console.error('')
      }
    }
    
    if (process.env.NODE_ENV !== 'test') {
      logger.error(`${errorCode} - ${errorMessage}`)
    }

    res.status(errorCode).json(response)
  }
}

module.exports = errorHandler
/* eslint-enable */