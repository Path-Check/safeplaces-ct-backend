const policy = require('./policy');
const auth = require('@pathcheck/safeplaces-auth');
const { userService } = require('./db');

const pkClient = new auth.JWKSClient(
  `${process.env.AUTH0_BASE_URL}/.well-known/jwks.json`,
);

const auth0Strategy = new auth.strategies.Auth0({
  jwksClient: pkClient,
  apiAudience: process.env.AUTH0_API_AUDIENCE,
});

const symJWTStrategy = new auth.strategies.SymJWT({
  algorithm: 'HS256',
  privateKey: process.env.JWT_SECRET,
});

const namespace = process.env.AUTH0_CLAIM_NAMESPACE;

module.exports = new auth.Enforcer({
  strategy: () => {
    return process.env.NODE_ENV === 'test' ? symJWTStrategy : auth0Strategy;
  },
  userGetter: id => userService.findOne({ idm_id: id }),
  authorizer: (decoded, req) => {
    const roles = decoded[`${namespace}/roles`];
    if (!roles) throw new Error('No roles found in token');
    const { path } = req.route;
    const role = roles[0];
    const allowed = policy.authorize(role, req.method.toUpperCase(), path);
    if (!allowed) {
      throw new Error('Operation is not allowed');
    }
  },
});
