const auth = require('@pathcheck/safeplaces-auth');
const { userService } = require('../../lib/db');

const gApi = auth.api.guard({
  db: {
    idmToDb: async idm_id => {
      const user = await userService.findOne({ idm_id });
      if (!user) return null;
      return user.id;
    },
  },
  auth0: {
    baseUrl: process.env.AUTH0_BASE_URL,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    apiAudience: process.env.AUTH0_API_AUDIENCE,
    realm: process.env.AUTH0_REALM,
  },
  cookie: {
    secure: process.env.NODE_ENV !== 'development',
    sameSite: process.env.BYPASS_SAME_SITE !== 'true',
    domain: process.env.DOMAIN,
  },
});

const endpoints = {
  login: gApi.login,
  logout: gApi.logout,
  mfa: gApi.mfa,
  users: {
    // Dummy endpoint namespaced under `/auth/users` for easy testing of whether
    // a user is allowed to access `/auth/users/**/*` resources.
    reflect: (req, res) => res.status(204).end(),
  },
};

if (process.env.AUTH0_MANAGEMENT_ENABLED === 'true') {
  const userManagementEndpoints = require('../../lib/userManagement');
  Object.assign(endpoints.users, userManagementEndpoints.users);
}

module.exports = endpoints;
