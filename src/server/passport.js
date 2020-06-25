const passport = require('passport');
const ldap = require('ldapjs');
const ldapEscape = require('ldap-escape');
const CustomStrategy = require('passport-custom').Strategy;
const ldapServerUrl = `ldap://${process.env.LDAP_HOST}:${process.env.LDAP_PORT}`;

const ldapClient = ldap.createClient({
  url: ldapServerUrl,
});

ldapClient.on('error', err => {
  if (err.message.startsWith('connect ECONNREFUSED')) {
    throw new Error(
      `LDAP server not found at ${ldapServerUrl}. Please start a server to enable authentication. Please see README.md for more information.`,
    );
  } else {
    console.error(err);
  }
});

ldapClient.bind(process.env.LDAP_BIND, process.env.LDAP_PASS, err => {
  if (err) console.log(err);
});

/**
 * Validate the filter
 */

if (process.env.LDAP_FILTER.indexOf('{{username}}') === -1) {
  throw new Error(
    'LDAP_FILTER environment variable must contain the keyword {{username}}. ' +
      'These keywords will be replaced by the request details appropriately.',
  );
}

passport.use(
  'ldap',
  new CustomStrategy(function (req, done) {
    /*
     * Filter will look like
     * (&(cn={{username}})(objectClass=person))
     * {{username}} will be replaced by the sent username
     */

    const filter = process.env.LDAP_FILTER.replace(
      /{{username}}/g,
      ldapEscape.filter`${req.body.username}`,
    );

    const query = process.env.LDAP_SEARCH;

    ldapClient.search(
      query,
      {
        filter,
        scope: 'sub',
      },
      (err, res) => {
        if (err) console.error(err);

        res.on('searchEntry', function (entry) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[LDAP] search entry');
            console.log(entry.object);
          }
          // Compare the retrieved password and the sent password.
          if (entry.object.userPassword !== req.body.password) {
            return done(null, {});
          }

          return done(err, entry.object);
        });

        res.on('error', function (err) {
          if (process.env.NODE_ENV === 'development') {
            console.error(err.message);
          }
          return done(null, {});
        });
      },
    );
  }),
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

module.exports = passport;
