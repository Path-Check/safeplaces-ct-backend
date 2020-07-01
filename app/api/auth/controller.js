const request = require('superagent');
const auth = require('../../auth');

exports.login = (req, res) => {
  const { username, password } = req.body;

  request('POST', `${process.env.AUTH0_BASE_URL}/oauth/token`)
    .type('form')
    .send({
      grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
      username: username,
      password: password,
      audience: process.env.AUTH0_API_AUDIENCE,
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      realm: process.env.AUTH0_REALM,
      scope: 'openid',
    })
    .then(res => res.body)
    .then(data => {
      const accessToken = data['access_token'];
      const expiresIn = parseInt(data['expires_in']);

      const cookieString = auth.utils.generateCookieString({
        name: 'auth_token',
        value: accessToken,
        path: '/',
        expires: new Date(Date.now() + expiresIn * 1000),
        httpOnly: true,
        sameSite: process.env.BYPASS_SAME_SITE !== 'true',
        secure: process.env.NODE_ENV !== 'development',
      });

      res.status(200).header('Set-Cookie', cookieString).json({
        token: accessToken,
        maps_api_key: process.env.SEED_MAPS_API_KEY,
      });
    })
    .catch(() => res.status(401).send('Unauthorized'));
};

exports.logout = (req, res) => {
  const cookieString = auth.utils.generateCookieString({
    name: 'auth_token',
    value: 'deleted',
    path: '/',
    expires: new Date(1970, 1, 2),
    httpOnly: true,
    sameSite: process.env.BYPASS_SAME_SITE !== 'true',
    secure: process.env.NODE_ENV !== 'development',
  });

  res
    .status(302)
    .header('Set-Cookie', cookieString)
    .redirect(process.env.AUTH_LOGOUT_REDIRECT_URL);
};
