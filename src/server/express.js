const express = require('express');
const http = require('http');
const Promise = require('bluebird');
const bodyParser = require('body-parser');
const expressLogger = require('../logger/express');
const errorHandler = require('./errorHandler');
const notFoundHandler = require('./notFoundHandler');
const responseTimeHandler = require('./responseTimeHandler');
const cookieParser = require('cookie-parser');
const { userService } = require('../../app/lib/db');
const auth = require('@aiyan/safeplaces-auth');

class Server {
  constructor() {
    this._app = express();

    const bodyParseJson = bodyParser.json({
      type: '*/*',
      limit: '50mb',
    });
    const bodyParseEncoded = bodyParser.urlencoded({ extended: false });

    this._app.use(cookieParser());
    this._app.use(expressLogger()); // Log Request
    this._app.use(bodyParseJson);
    this._app.use(bodyParseEncoded);

    /**
     * Authentication
     */

    const pkClient = new auth.JWKSClient(
      `${process.env.AUTH0_BASE_URL}/.well-known/jwks.json`,
    );

    const auth0Strategy = new auth.strategies.Auth0({
      jwksClient: pkClient,
      apiAudience: process.env.AUTH0_API_AUDIENCE,
    });

    const symJWTStrategy = new auth.strategies.SymJWT({
      algorithm: 'HS256',
      privateKey: process.env.JWT_SECRET,
    });

    this._enforcer = new auth.Enforcer({
      strategy: () => {
        return process.env.NODE_ENV === 'test'
          ? symJWTStrategy
          : auth0Strategy;
      },
      userGetter: id => userService.findOne({ idm_id: id }),
    });

    //this._enforcer.secure(this._app);

    this._app.use(responseTimeHandler());

    this._router = express.Router();
    this._app.use('/', this._router);

    process.nextTick(() => {
      this._app.use(notFoundHandler());
      this._app.use(errorHandler());
    });

    this._server = http.createServer(this._app);
  }

  get app() {
    return this._app;
  }

  start(port = 3000) {
    if (!port) throw new Error('Port not set.');

    return Promise.fromCallback(cb => this._server.listen(port, cb));
  }

  close() {
    this._server.close();
  }

  /**
   * @method get
   */
  get() {
    return this._router.get(...arguments);
  }

  /**
   * @method get
   */
  post() {
    return this._router.post(...arguments);
  }

  /**
   * @method put
   */
  put() {
    return this._router.put(...arguments);
  }

  /**
   * @method delete
   */
  delete() {
    return this._router.delete(...arguments);
  }

  /**
   * @method wrapAsync
   */
  wrapAsync(asyncFn, validate = false) {
    return (req, res, next) => {
      if (validate) {
        return this._enforcer.handleRequest(req, res)
          .then(() => asyncFn(req, res, next))
          .catch(next);
      }
      asyncFn(req, res, next).catch(next);
    };
  }
}

module.exports = Server;
