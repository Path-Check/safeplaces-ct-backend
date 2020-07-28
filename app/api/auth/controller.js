const auth = require('@pathcheck/safeplaces-auth');

const loginHandler = new auth.handlers.Login({
  auth0: {
    baseUrl: process.env.AUTH0_BASE_URL,
    apiAudience: process.env.AUTH0_API_AUDIENCE,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    realm: process.env.AUTH0_REALM,
  },
  cookie: {
    secure: process.env.NODE_ENV !== 'development',
    sameSite: process.env.BYPASS_SAME_SITE !== 'true',
    domain: process.env.DOMAIN,
  },
});

const logoutHandler = new auth.handlers.Logout({
  redirect: process.env.AUTH_LOGOUT_REDIRECT_URL,
  cookie: {
    secure: process.env.NODE_ENV !== 'development',
    sameSite: process.env.BYPASS_SAME_SITE !== 'true',
    domain: process.env.DOMAIN,
  },
});

const endpoints = {
  login: loginHandler.handle.bind(loginHandler),
  logout: loginHandler.handle.bind(logoutHandler),
  users: {
    // Dummy endpoint namespaced under `/auth/users` for easy testing of whether
    // a user is allowed to access `/auth/users/**/*` resources.
    reflect: (req, res) => res.status(204).end(),
  },
};

if (process.env.AUTH0_MANAGEMENT_ENABLED === 'true') {
  Object.assign(endpoints.users, require('../../lib/userManagement'));
}

module.exports = endpoints;
