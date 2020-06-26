const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function isValidDate(date) {
  return (
    date &&
    Object.prototype.toString.call(date) === '[object Date]' &&
    !isNaN(date)
  );
}

function signJWT({ subject, role, expires }) {
  if (!isValidDate(expires)) {
    throw new Error('Expires should be a date');
  }
  return jwt.sign(
    {
      sub: subject,
      role: role,
      iat: Math.floor(Date.now() / 1000), // Get time in seconds
      exp: Math.floor(expires.getTime() / 1000), // Get time in seconds
    },
    process.env.JWT_SECRET,
    {
      algorithm: 'HS256',
    },
  );
}

function generateCSRFToken() {
  return crypto
    .randomBytes(32)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substr(0, 16);
}

function generateQueryString(obj) {
  let queryString = '';
  for (const [k, v] of Object.entries(obj)) {
    const encodedV = encodeURIComponent(String(v));
    queryString += `&${k}=${encodedV}`;
  }
  queryString = queryString.substr(1);
  return queryString;
}

function generateCookieString(attributes) {
  const { name, value, expires, httpOnly, sameSite, path, secure } = attributes;

  if (!isValidDate(expires)) {
    throw new Error('Expires should be a date');
  }

  let cookieString = `${name}=${value};`;
  if (expires) {
    cookieString += expires.toUTCString + ';';
  }
  if (path) {
    cookieString += `Path=${path};`;
  }
  if (httpOnly) {
    cookieString += 'HttpOnly;';
  }
  if (secure) {
    cookieString += 'Secure;';
  }
  if (sameSite) {
    cookieString += 'SameSite=Strict;';
  } else {
    cookieString += 'SameSite=None;';
  }

  return cookieString;
}

module.exports = {
  generateCookieString,
  generateQueryString,
  generateCSRFToken,
  signJWT,
};
