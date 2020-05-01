const bcrypt = require('bcrypt');
var express = require('express');
const jwtSecret = require('../config/jwtConfig');
const jwt = require('jsonwebtoken');
const passport = require('passport');
var router = express.Router();

const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

var organizations = require('../db/models/organizations');
var trails = require('../db/models/trails');
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

function formatRedactedTrailData(redactedTrailRecords) {
  let redactedTrailData = {};
  if (redactedTrailRecords) {
    let redactedTrail = trails.getRedactedTrailFromRecord(redactedTrailRecords);
    redactedTrailData = {
      identifier: redactedTrailRecords[0].redacted_trail_id,
      organization_id: redactedTrailRecords[0].organization_id,
      trail: redactedTrail,
      user_id: redactedTrailRecords[0].user_id
    }
  }
  return redactedTrailData;
}

// *** GET all redacted trails *** //
router.get('/redacted_trails', passport.authenticate('jwt', { session: false }), function(req, res) {
  let redactedTrailsResponse = {};
  trails.getAll().then((redactedTrails) => {
    let redactedTrailsList = [];

    // Map all redactedTrails by redacted trail 'identifier'
    // i.e., Groups all trail points belonging to one 'identifier'
    // into a trail array.
    let redactedTrailsMap = redactedTrails.reduce(function (r, a) {
      r[a.redacted_trail_id] = r[a.redacted_trail_id] || [];
      r[a.redacted_trail_id].push(a);
      return r;
    } , Object.create(null));

    // Make the Map with 'identifier' as key into the final
    // list format with:
    // [
    //   {
    //     identifier: '',
    //     organization_id: '',
    //     trail: [],
    //     user_id: ''
    //   }, ...
    // ]
    Object.keys(redactedTrailsMap).forEach((key, index) => {
      let element = redactedTrailsMap[key];
      redactedTrailsList.push(formatRedactedTrailData(element));
    });

    // Populate organization information in response
    organizations.findOne({id: req.user.organization_id}).then((organization) => {
      redactedTrailsResponse = {
        'organization': {
          'organization_id' : organization.id,
          'authority_name' : organization.authority_name,
          'info_website' : organization.info_website,
          'safe_path_json' : organization.safe_path_json
        },
        'data': redactedTrailsList
      };
      res.status(200).json(redactedTrailsResponse);
    });
  });
});

// *** POST redacted trail *** //
router.post('/redacted_trail',
  passport.authenticate('jwt', { session: false }), function(req, res) {
    let redactedTrailReturnData = {};
    trails.insertRedactedTrailSet(
        req.body.trail,
        req.body.identifier,
        req.user.organization_id,
        req.user.id
      ).then((redactedTrailRecords) => {
        if (redactedTrailRecords) {
          redactedTrailReturnData = {
            data: formatRedactedTrailData(redactedTrailRecords),
            success: true
          };
        }
      res.status(200).json(redactedTrailReturnData);
    }).catch((err) => {
      return done(err);
    });
  }
);

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
            //TODO: log error
            return done(null, false);
          }
          else{
            bcrypt.compare(password, loginUser.password, function(err, check) {
              if (err){
                //TODO: log error
                return done();
              }
              else if (check){
                return done(null, [{username: loginUser.username}]);
              }
              else{
                //TODO: log error
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
  jwtFromRequest: ExtractJWT.fromHeader("authorization"),
  secretOrKey: jwtSecret.secret,
};

passport.use(
  'jwt',
  new JWTstrategy(opts, (jwt_payload, done) => {
    try {
      users.findOne({username: jwt_payload.id}).then(user => {
        if (user) {
          // note the return removed with passport JWT - add this return for passport local
          done(null, user);
        } else {
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