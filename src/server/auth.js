/**
 * Safe Places Custom Authorization Handlers
 *
 * Status: IN TRANSITION
 *
 * _
 * | - Token in body
 * | - Token in cookie and body <- (You are here)
 * | - Token in cookie
 * v
 */

const jwt = require('jsonwebtoken');
const { userService } = require('../../app/lib/db');

const { JWT_SECRET } = process.env;

function tokenStrategy(accessToken) {
  return new Promise((resolve, reject) => {
    if (!accessToken) {
      return reject(new Error('No access token found'));
    }
    jwt.verify(
      accessToken,
      JWT_SECRET,
      {
        algorithms: ['HS256'],
      },
      (err, decoded) => {
        if (err) {
          return reject(err);
        }
        const username = decoded.sub;
        if (!username) {
          return reject(new Error('No username found'));
        }
        userService
          .findOne({ username })
          .then(user => {
            if (!user) {
              return reject(new Error('No user found'));
            } else {
              return resolve(user);
            }
          })
          .catch(err => {
            return reject(err);
          });
      },
    );
  });
}

function tryCookieStrategy(req) {
  return new Promise((resolve, reject) => {
    if (!req.cookies) {
      return reject(new Error('No cookies found'));
    }
    const accessToken = req.cookies['auth_token'];
    if (!accessToken) {
      return reject(new Error('No access token found in cookie'));
    }
    tokenStrategy(accessToken)
      .then(user => resolve(user))
      .catch(err => reject(err));
  });
}

function tryHeaderStrategy(req) {
  return new Promise((resolve, reject) => {
    const { headers } = req;
    if (!headers) {
      return reject(new Error('No headers found'));
    }
    const authHeader = headers['Authorization'] || headers['authorization'];
    if (!authHeader) {
      return reject(new Error('No authorization header found'));
    }
    // Remove the "bearer" prefix and whitespace on the ends.
    const accessToken = authHeader.replace('Bearer ', '').trim();
    if (!accessToken) {
      return reject(new Error('No access token found in header'));
    }
    tokenStrategy(accessToken)
      .then(user => resolve(user))
      .catch(err => reject(err));
  });
}

const hybridStrategy = async req => {
  try {
    return await tryCookieStrategy(req);
  } catch (e) {}

  try {
    return await tryHeaderStrategy(req);
  } catch (e) {}

  throw new Error('Unauthorized');
};

module.exports = { hybridStrategy };
