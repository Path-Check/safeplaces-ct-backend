const jwt = require('jsonwebtoken');
const jwtSecret = require('../../../config/jwtConfig');

/**
 * @method login
 *
 * Login Check
 *
 */
exports.login = (req, res) => {
  const { user } = req;

  if (user && Object.entries(user).length > 0) {
    const token = jwt.sign(
      {
        sub: user.cn,
        role: user.role,
        iat: ~~(Date.now() / 1000),
        exp:
          ~~(Date.now() / 1000) +
          (parseInt(process.env.JWT_EXP) || 1 * 60 * 60), // Default expires in an hour
      },
      jwtSecret.secret,
    );
    res.status(200).json({
      token: token,
      maps_api_key: process.env.SEED_MAPS_API_KEY,
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials.' });
  }
};
