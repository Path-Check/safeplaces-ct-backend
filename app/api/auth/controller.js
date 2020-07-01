const auth = require('@aiyan/safeplaces-auth');

const loginHandler = new auth.handlers.Login({
  auth0: {
    baseUrl: process.env.AUTH0_BASE_URL,
    apiAudience: process.env.AUTH0_API_AUDIENCE,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    realm: process.env.AUTH0_REALM, // TODO: Update library to use realm
  },
  cookie: {
    secure: process.env.NODE_ENV !== 'development',
    sameSite: process.env.BYPASS_SAME_SITE !== 'true',
  },
});

const logoutHandler = new auth.handlers.Logout({
  redirect: process.env.AUTH_LOGOUT_REDIRECT_URL,
  cookie: {
    secure: process.env.NODE_ENV !== 'development',
    sameSite: process.env.BYPASS_SAME_SITE !== 'true',
  },
});

/**
 * Log in
 */
exports.login = loginHandler.handle.bind(loginHandler);

/**
 * Log out
 */
exports.logout = logoutHandler.handle.bind(logoutHandler);
