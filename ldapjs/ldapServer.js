const ldap = require('ldapjs');
const fs = require('fs');
const path = require('path');

const server = ldap.createServer();

server.bind(process.env.LDAP_BIND, function (req, res, next) {
  if (
    req.dn.toString() !== process.env.LDAP_BIND ||
    req.credentials !== process.env.LDAP_PASS
  ) {
    return next(new ldap.InvalidCredentialsError());
  }

  res.end();
  return next();
});

function authorize(req, res, next) {
  if (!req.connection.ldap.bindDN.equals(process.env.LDAP_BIND)) {
    return next(new ldap.InsufficientAccessRightsError());
  }

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
        dn: process.env.LDAP_ORG,
        attributes: {
          cn: record[0],
          userPassword: record[1],
          objectclass: record[2],
        },
      };
    }

    return next();
  });
}

const pre = [authorize, loadPasswd];

server.search(process.env.LDAP_SEARCH, pre, function (req, res, next) {
  Object.keys(req.users).forEach(function (k) {
    if (
      req.filter.matches(req.users[k].attributes) &&
      req.dn.toString() === req.users[k].dn
    ) {
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
