const jwt = require('jsonwebtoken');

function validateToken(accessToken) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      accessToken,
      process.env.JWT_SECRET,
      {
        algorithms: ['HS256'],
      },
      (err, decoded) => {
        if (err) return reject(err);
        return resolve(decoded);
      },
    );
  });
}

module.exports = { validateToken };
