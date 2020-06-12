const boom = require('boom')

/* eslint-disable */
const notFoundHandler = () => {
  return (req, res, next) => {
    next(boom.notFound(`Route ${req.method} ${req.url} not found!`, { method: req.method, url: req.url }))
  }
}

module.exports = notFoundHandler
/* eslint-enable */