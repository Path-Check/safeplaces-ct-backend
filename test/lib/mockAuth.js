const jwt = require('jsonwebtoken');

function getAccessToken(idmId, role) {
  const ns = process.env.AUTH0_CLAIM_NAMESPACE;
  return jwt.sign(
    {
      sub: idmId,
      [`${ns}/roles`]: [role],
    },
    process.env.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: '1h'
    }
  );
}

module.exports = { getAccessToken };
