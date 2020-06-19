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
    const expTime = Date.now() + parseInt(process.env.JWT_EXP) || 60 * 60;
    const expDate = new Date(expTime);

    const token = jwt.sign(
      {
        sub: user.cn,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(expDate.getTime() / 1000),
      },
      jwtSecret.secret,
    );

    const sameSite =
      process.env.BYPASS_SAME_SITE === 'true' ? 'None' : 'Strict';

    const cookieProps = [
      `auth_token=${token}`,
      `Expires=${expDate.toUTCString()}`,
      'HttpOnly',
      `SameSite=${sameSite}`,
    ];

    if (process.env.NODE_ENV !== 'development') {
      cookieProps.push('Secure');
    }

    const cookie = cookieProps.join(';');

    res.status(200).header('Set-Cookie', cookie).json({
      token: token,
      maps_api_key: process.env.SEED_MAPS_API_KEY,
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials.' });
  }
};
