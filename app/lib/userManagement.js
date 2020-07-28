const auth = require('@pathcheck/safeplaces-auth');
const { uuid } = require('uuidv4');
const { userService } = require('./db');

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

usersHandler
  .init()
  .then(() => console.log('Users handler connector initialized'));

module.exports = {
  list: usersHandler.handleList.bind(usersHandler),
  get: usersHandler.handleGet.bind(usersHandler),
  delete: usersHandler.handleDelete.bind(usersHandler),
  update: usersHandler.handleUpdate.bind(usersHandler),
  assignRole: usersHandler.handleAssignRole.bind(usersHandler),
  create: usersHandler.handleCreate.bind(usersHandler),
  resetPassword: usersHandler.handleSendPasswordResetEmail.bind(usersHandler),
};
