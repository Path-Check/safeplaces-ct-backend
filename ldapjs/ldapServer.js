const ldap = require('ldapjs');
const fs = require('fs');
const path = require('path');

const server = ldap.createServer();

server.bind('cn=root', function (req, res, next) {
  if (req.dn.toString() !== 'cn=root' || req.credentials !== 'safepaths') {
    return next(new ldap.InvalidCredentialsError());
  }

  res.end();
  return next();
});

function authorize(req, res, next) {
  if (!req.connection.ldap.bindDN.equals('cn=root'))
    return next(new ldap.InsufficientAccessRightsError());

  return next();
}

function loadPasswd(req, res, next) {
  fs.readFile(path.resolve(__dirname, 'passwd'), 'utf8', function (err, data) {
    if (err) return next(new ldap.OperationsError(err.message));

    req.users = {};

    const lines = data.replace(/\r/g, '').split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i] || /^#/.test(lines[i])) continue;

      const record = lines[i].split(':');
      if (!record || !record.length) continue;

      req.users[record[0]] = {
        dn: `cn=${record[0]}, ou=users, o=safeplaces`,
        attributes: {
          cn: record[0],
          password: record[1],
          role: record[2],
          maps_api_key: process.env.SEED_MAPS_API_KEY, // For testing purposes only
        },
      };
    }

    return next();
  });
}

const pre = [authorize, loadPasswd];

server.search('o=safeplaces', pre, function (req, res, next) {
  Object.keys(req.users).forEach(function (k) {
    if (req.filter.matches(req.users[k].attributes)) {
      res.send(req.users[k]);
      res.end();
      return next();
    }
  });

  return next(new Error('Not found'));
});

module.exports = {
  start: () => {
    return new Promise(resolve => {
      server.listen(process.env.LDAP_PORT, function () {
        console.log('LDAP server listening at ' + server.url);
        resolve();
      });
    });
  },
  stop: () => {
    server.close();
  },
};
