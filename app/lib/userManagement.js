const auth = require('@pathcheck/safeplaces-auth');
const { v4: uuidv4 } = require('uuid');
const { userService } = require('./db');

const mApi = auth.api.management({
  privateKey: process.env.JWT_SECRET,
  auth0: {
    baseUrl: process.env.AUTH0_BASE_URL,
    clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
    clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
    apiAudience: process.env.AUTH0_MANAGEMENT_API_AUDIENCE,
    realm: process.env.AUTH0_REALM,
  },
  db: {
    dbToIdm: async id => {
      const user = await userService.findOne({ id });
      if (!user) return null;
      return user.idm_id;
    },
    idmToDb: async idm_id => {
      const user = await userService.findOne({ idm_id });
      if (!user) return null;
      return user.id;
    },
    createUser: async (email, idmId, orgId) => {
      const dbId = uuidv4();
      await userService.create({
        username: email,
        id: dbId,
        idm_id: idmId,
        organization_id: orgId,
      });
      return dbId;
    },
    deleteUser: idm_id => userService.deleteWhere({ idm_id }),
  },
});

module.exports = mApi;
