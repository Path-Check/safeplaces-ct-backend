const jwt = require('jsonwebtoken');
const jwks = require('jwks-rsa');

const jwksClient = jwks({
  strictSsl: true,
  jwksUri: `${process.env.AUTH0_BASE_URL}/.well-known/jwks.json`,
});

function getSigningKey(header, callback) {
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) throw err;
    const signingKey = key.getPublicKey();
    return callback(null, signingKey);
  });
}

function validateToken(accessToken) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      accessToken,
      getSigningKey,
      {
        audience: process.env.AUTH0_API_AUDIENCE,
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) return reject(err);
        return resolve(decoded);
      },
    );
  });
}

module.exports = { validateToken };
