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

// *** POST /login user *** //
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

// *** GET health *** //
router.get('/health', function(req, res) {
  res.status(200).json({
    message: 'All Ok!'
  });
});

// *** GET all redacted trails *** //
router.get('/redacted_trails', passport.authenticate('jwt', { session: false }), function(req, res) {
  let redacted_trails = {
    "data": [
      {
        "identifier": "a88309c1-26cd-4d2b-8923-af0779e423a3",
        "organization_id": "a88309c2-26cd-4d2b-8923-af0779e423a3",
        "trail": [
          {
            "latitude": 12.34,
            "longitude": 12.34,
            "time": 123456789
          }
        ],
        "user_id": "a88309ca-26cd-4d2b-8923-af0779e423a3"
      },
      {
        "identifier": "a88309c1-26cd-4d2b-8923-af0779e423a4",
        "organization_id": "a88309c2-26cd-4d2b-8923-af0779e423a3",
        "trail": [
          {
            "latitude": 12.34,
            "longitude": 12.34,
            "time": 123456789
          }
        ],
        "user_id": "a88309ca-26cd-4d2b-8923-af0779e423a3"
      }
    ]
  };
  res.status(200).json(redacted_trails);
});

// *** POST redacted trail *** //
router.post('/redacted_trail',
  passport.authenticate('jwt', { session: false }), function(req, res) {
    let redacted_trails = {
      "data": {
        "identifier": "a88309c1-26cd-4d2b-8923-af0779e423a3",
        "organization_id": "a88309c2-26cd-4d2b-8923-af0779e423a3",
        "trail": [
          {
            "latitude": 12.34,
            "longitude": 12.34,
            "time": 123456789
          }
        ],
        "user_id": "a88309ca-26cd-4d2b-8923-af0779e423a3"
      },
      "success": true
    };
    res.status(200).json(redacted_trails);
});

// *** GET an organisation's safe paths *** //
router.get('/safe_path/:organization_id', function(req, res) {
  let safe_paths = {
    "authority_name": "Fake Organization",
    "concern_points": [
      {
        "latitude": 12.34,
        "longitude": 12.34,
        "time": 1584924233
      },
      {
        "latitude": 12.34,
        "longitude": 12.34,
        "time": 1584924583
      }
    ],
    "info_website": "https://www.something.gov/path/to/info/website",
    "publish_date_utc": "1584924583"
  };
  res.status(200).json(safe_paths);
});

// *** POST safe paths *** //
router.post('/safe_paths',
  passport.authenticate('jwt', { session: false }), function(req, res) {
    let safe_paths = {
      "datetime_created": "Fri, 27 Mar 2020 04:32:12 GMT",
      "organization_id": "a88309c2-26cd-4d2b-8923-af0779e423a3",
      "safe_path": {
        "authority_name": "Fake Organization",
        "concern_points": [
          {
            "latitude": 12.34,
            "longitude": 12.34,
            "time": 123
          },
          {
            "latitude": 12.34,
            "longitude": 12.34,
            "time": 456
          }
        ],
        "info_website": "https://www.something.gov/path/to/info/website",
        "publish_date_utc": 1584924583
      },
      "user_id": "a88309c1-26cd-4d2b-8923-af0779e423a3"
    };
    res.status(200).json(safe_paths);
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
        });
      }
      catch(e){throw (e);}
    }
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