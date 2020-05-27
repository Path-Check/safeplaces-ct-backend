const passport = require('passport');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const jwtSecret = require('../../config/jwtConfig');
const users = require('../../db/models/users');
const ldap = require('ldapjs');
const CustomStrategy = require('passport-custom').Strategy;

const opts = {
  jwtFromRequest: ExtractJWT.fromHeader('authorization'),
  secretOrKey: jwtSecret.secret,
};

const jwtStrategy = new JWTstrategy(opts, async (jwt_payload, done) => {
  try {
    const { sub, exp } = jwt_payload;

    const isExpired = exp - ~~(Date.now() / 1000) < 0;
    if (isExpired) {
      return done(new Error('Token Expired'), false);
    }

    const user = await users.findOne({ username: sub });
    if (user) {
      done(null, user);
    } else {
      done(new Error('User not found!'), false);
    }
  } catch (err) {
    done(err);
  }
});

passport.use('jwt', jwtStrategy);

const ldapClient = ldap.createClient({
  url: 'ldap://127.0.0.1:1389',
});

ldapClient.bind('cn=root', process.env.DB_PASS, err => {
  if (err) console.log(err);
});

passport.use('ldap', new CustomStrategy(
  function(req, done) {
    ldapClient.search('o=safeplaces', {
      filter: `(&(cn=${req.body.username})(password=${req.body.password}))`
    }, (err, res) => {
      res.on('searchEntry', function(entry) {
        return done(err, entry.object);
      });
      res.on('error', function(err) {
        console.log(err.message);
        return done(null, {});
      });
    });
  },
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

module.exports = passport;
