const bcrypt = require('bcrypt');
var express = require('express');
const jwtSecret = require('../config/jwtConfig');
const jwt = require('jsonwebtoken');
const passport = require('passport');
var router = express.Router();

const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

var users = require('../db/models/users');

const LocalStrategy = require('passport-local').Strategy;

// *** GET index *** //
router.get('/', function(req, res, next) {
  res.send('send index');
});

// *** GET all users *** //
router.get('/users', passport.authenticate('jwt', { session: false }), function(req, res) {
  users.getAll()
  .then(function(users) {
    res.status(200).json(users);
  })
  .catch(function(error) {
    next(error);
  });
});


router.post('/login',	passport.authenticate('local'), function(req, res) {
  users.findOne({username: req.body.username}).then((user) => {
    const token = jwt.sign({ id: user.username }, jwtSecret.secret);
    res.status(200).json({
      token: token,
      maps_api_key: user.maps_api_key
    });
  }).catch((err) => {
    return done(err);
  });
});

module.exports = router;

passport.use(
  'local',
  new  LocalStrategy({
    passReqToCallback : true,
    session : false
  }, (req, username, password, done) => {
    loginAttempt();
    async function loginAttempt() {
      try{
        users.findOne({username: username}).then((loginUser) => {
          if(loginUser == null){
            //TODO: show something logical
            console.log('Error no user found');
            return done(null, false);
          }
          else{
            bcrypt.compare(password, loginUser.password, function(err, check) {
              if (err){
                //TODO: show something logical
                console.log('Error while checking password');
                return done();
              }
              else if (check){
                return done(null, [{username: loginUser.username}]);
              }
              else{
                //TODO: show something logical
                console.log('Error wrong login details');
                return done(null, false);
              }
            });
          }
        }).catch((err) => {
          return done(err);
        })
      }
      catch(e){throw (e);}
    };
  })
);

const opts = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret.secret,
};

passport.use(
  'jwt',
  new JWTstrategy(opts, (jwt_payload, done) => {
    try {
      users.findOne({username: jwt_payload.id}).then(user => {
        if (user) {
          console.log('user found in db in passport');
          // note the return removed with passport JWT - add this return for passport local
          done(null, user);
        } else {
          console.log('user not found in db');
          done(null, false);
        }
      });
    } catch (err) {
      done(err);
    }
  }),
);

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});		