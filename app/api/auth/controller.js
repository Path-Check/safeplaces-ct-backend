const auth = require('@pathcheck/safeplaces-auth');
const { uuid } = require('uuidv4');
const { userService } = require('../../lib/db');

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

const hook = new auth.common.Hook({
  id: {
    dbToIdm: async dbId => {
      const user = await userService.findOne({ id: dbId });
      if (!user) return null;
      return user.idm_id;
    },
    idmToDb: async idmId => {
      const user = await userService.findOne({ idm_id: idmId });
      if (!user) return null;
      return user.id;
    },
  },
  users: {
    create: (email, idmId, orgId) =>
      userService.create({
        username: email,
        id: uuid(),
        idm_id: idmId,
        organization_id: orgId,
      }),
    delete: dbId => userService.deleteWhere({ id: dbId }),
    getAll: async () => {
      const users = await userService.all();
      return users.map(user => ({
        id: user.id,
        idm_id: user.idm_id,
        email: user.username,
      }));
    },
  },
});

const usersHandler = new auth.handlers.Users({
  auth0: {
    baseUrl: process.env.AUTH0_BASE_URL,
    apiAudience: process.env.AUTH0_MANAGEMENT_API_AUDIENCE,
    clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
    clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
    realm: process.env.AUTH0_REALM,
  },
  hook,
  // The following option, when set to true, will destructively resolve
  // synchronization problems between the IDM and DB. Use when data integrity
  // is more important than data preservation.
  forceProblemResolution: false,
});

if (process.env.NODE_ENV !== 'test') {
  usersHandler
    .init()
    .then(() => console.log('Users handler connector initialized'));
}

exports.users = {};

/**
 * Log in
 */
exports.login = loginHandler.handle.bind(loginHandler);

/**
 * Log out
 */
exports.logout = logoutHandler.handle.bind(logoutHandler);

/**
 * List users
 */
exports.users.list = usersHandler.handleList.bind(usersHandler);

/**
 * Get user
 */
exports.users.get = usersHandler.handleGet.bind(usersHandler);

/**
 * Delete user
 */
exports.users.delete = usersHandler.handleDelete.bind(usersHandler);

/**
 * Update user
 */
exports.users.update = usersHandler.handleUpdate.bind(usersHandler);

/**
 * Assign role to user
 */
exports.users.assignRole = usersHandler.handleAssignRole.bind(usersHandler);

/**
 * Create user
 */
exports.users.create = usersHandler.handleCreate.bind(usersHandler);

/**
 * Send password reset email
 */
exports.users.resetPassword = usersHandler.handleSendPasswordResetEmail.bind(
  usersHandler,
);
