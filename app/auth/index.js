const crypto = require('crypto');

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

module.exports = { generateCSRFToken, generateQueryString };
