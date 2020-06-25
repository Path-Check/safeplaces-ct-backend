const jwt = require('jsonwebtoken');
const request = require('superagent');
const auth = require('../../auth');

const redirectUri = `${process.env.BACKEND_BASE_URL}/auth/callback`;

// TODO: Clean up global constants

/**
 * @method login
 *
 * Login Check
 */
exports.login = (req, res) => {
  const { user } = req;

  if (user && Object.entries(user).length > 0) {
    const expTime =
      Date.now() + 1000 * (parseInt(process.env.JWT_EXP) || 60 * 60);
    const expDate = new Date(expTime);

    const token = jwt.sign(
      {
        sub: user.cn,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(expDate.getTime() / 1000),
      },
      process.env.JWT_SECRET,
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

exports.authLogin = (req, res) => {
  const scope = 'openid profile';
  const clientId = process.env.AUTH0_CLIENT_ID;
  const state = auth.generateCSRFToken();
  let url =
    `${process.env.AUTH0_BASE_URL}/authorize?` +
    auth.generateQueryString({
      response_type: 'code',
      audience: process.env.AUTH0_API_AUDIENCE,
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope,
      state: state,
    });

  res.status(302).redirect(url);
};

exports.authLogout = (req, res) => {
  const clientId = process.env.AUTH0_CLIENT_ID;
  const url =
    `${process.env.AUTH0_BASE_URL}/v2/logout?` +
    auth.generateQueryString({
      client_id: clientId,
      returnTo: process.env.AUTH_LOGOUT_REDIRECT_URL,
    });
  res.status(302).redirect(url);
};

exports.authCallback = (req, res) => {
  if (!req.query.code) {
    return res.status(400).send('Bad request');
  }

  request('POST', `${process.env.AUTH0_BASE_URL}/oauth/token`)
    .type('form')
    .send({
      grant_type: 'authorization_code',
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      code: req.query.code,
      redirect_uri: redirectUri,
    })
    .then(res => res.body)
    .then(data => {
      console.log(data);
      const accessToken = data['access_token'];
      const expiresIn = data['expires_in'] * 1000; // Expiration time to ms.

      const expDate = new Date(Date.now() + expiresIn);

      const sameSite =
        process.env.BYPASS_SAME_SITE === 'true' ? 'None' : 'Strict';

      const cookieProps = [
        `access_token=${accessToken}`,
        `Path=/`,
        `Expires=${expDate.toUTCString()}`,
        'HttpOnly',
        `SameSite=${sameSite}`,
      ];

      if (process.env.NODE_ENV !== 'development') {
        cookieProps.push('Secure');
      }

      const cookie = cookieProps.join(';');

      return res
        .status(302)
        .header('Set-Cookie', cookie)
        .redirect(process.env.AUTH_LOGIN_REDIRECT_URL);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).send('Internal server error');
    });
};
