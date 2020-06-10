const passport = require('passport');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const jwtSecret = require('../../config/jwtConfig');
const users = require('../../db/models/users');
const ldap = require('ldapjs');
const CustomStrategy = require('passport-custom').Strategy;

const ldapServerUrl = `ldap://${process.env.LDAP_HOST}:${process.env.LDAP_PORT}`;

const opts = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
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

console.log('[LDAP] CreateClient')
const ldapClient = ldap.createClient({
  url: ldapServerUrl,
});

ldapClient.on('error', err => {
  console.log('[LDAP] on Error', err)
  if (err.message.startsWith('connect ECONNREFUSED')) {
    throw new Error(`LDAP server not found at ${ldapServerUrl}. Please start a server to enable authentication. Please see README.md for more information.`);
  } else {
    console.error(err);
  }
});

ldapClient.bind(process.env.LDAP_BIND, process.env.LDAP_PASS, err => {
  console.log('[LDAP] bind outside')
  if (err) console.log(err);
});

/**
 * Validate the filter
 */

if (
  process.env.LDAP_SEARCH.indexOf('{{username}}') === -1
) {
  console.log('[LDAP] error thrown')
  throw new Error(
    'LDAP_FILTER environment variable must contain the keyword {{username}}. ' +
    'These keywords will be replaced by the request details appropriately.'
  )
}

passport.use('ldap', new CustomStrategy(
  function(req, done) {
    /*
     * Filter will look like
     * (&(cn={{username}})(password={{password}}))
     * {{username}} will be replaced by the sent username
     * {{password}} will be replaced by the sent password
     */
    
    console.log('[LDAP] custom strategy')

    let query =
      process.env.LDAP_SEARCH
      .replace(/{{username}}/g, req.body.username);

    ldapClient.search(query, {
      filter: process.env.LDAP_FILTER,
      scope: 'base',
      // attributes: ['dn', 'sn', 'cn']
    }, (err, res) => {
      res.on('searchEntry', function(entry) {
        // Compare the retrieved password and the sent password.
        if (entry.object.userPassword !== req.body.password) {
          return done(null, {});
        }
        return done(err, entry.object);
      });
      res.on('error', function(err) {
        if (process.env.NODE_ENV === 'development') console.log(err.message);
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
