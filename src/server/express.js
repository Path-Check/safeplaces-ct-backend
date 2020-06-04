const express = require('express');
const http = require('http');
const Promise = require('bluebird');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./errorHandler')
// const notFoundHandler = require('./notFoundHandler')

const createError = require('http-errors');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
// const path = require('path');
const logger = require('morgan');
const passport = require('./passport');

class Server {
  constructor() {
    this._app = express();

    if (process.env.NODE_ENV !== 'test') {
      this._app.use(logger('dev'));
    }
    
    this._app.use(cors());
    this._app.use(express.json());
    this._app.use(express.urlencoded({ extended: false }));
    this._app.use(cookieParser());
    this._app.use(bodyParser.urlencoded({ extended: true }));
    this._app.use(
      expressSession({
        secret: 'keyboard cat',
        resave: true,
        saveUninitialized: true,
      }),
    );
    this._app.use(passport.initialize());
    this._app.use(passport.session());

    this._router = express.Router();
    this._app.use('/', this._router);

    this._app.use(function (req, res, next) {
      next(createError(404));
    }); // If we get to here then we obviously didn't find the route, so trigger error.
    this._app.use(errorHandler) // Catch all for errors.

    // error handler

    // TODO: Move error handling into module...
    // if (
    //   this._app.get('env') === 'development' ||
    //   this._app.get('env') === 'test'
    // ) {
    //   this._app.use(function (err, req, res) {
    //     res.status(err.status || 500);
    //     res.json({
    //       message: err.message,
    //       error: err,
    //     });
    //   });
    // }

    // // production error handler
    // // no stacktraces leaked to user
    // else {
    //   this._app.use(function (err, req, res) {
    //     res.status(err.status || 500);
    //     res.json({
    //       message: err.message,
    //     });
    //   });
    // }

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
  wrapAsync(fn, validate = false) {
    return (req, res, next) => {
      // Make sure to `.catch()` any errors and pass them along to the `next()`
      // middleware in the chain, in this case the error handler.
      if (validate) {
        passport.authenticate('jwt', { session: false }, (err, user) => {
          if (err) {
            return res.status(500).json({ message: err.message });
          } else if (user) {
            req.user = user;
            fn(req, res, next).catch(next);
          } else {
            console.log('Falling t')
            return res.status(401).send('Unauthorized');
          }
        })(req, res, next);
      } else {
        fn(req, res, next).catch(next);
      }
    };
  }
}

module.exports = Server;
