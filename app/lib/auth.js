const auth = require('@pathcheck/safeplaces-auth');
const { userService } = require('./db');
const policy = require('./policy');

const guard = new auth.Guard({
  jwksUri: `${process.env.AUTH0_BASE_URL}/.well-known/jwks.json`,
  getUser: idm_id => userService.findOne({ idm_id }),
  authorize: (decoded, req) => {
    const roles = decoded[`${namespace}/roles`];
    if (!roles) throw new Error('No roles found in token');

    const { path } = req.route;
    const role = roles[0];

    // Check if request is allowed by the policy.
    const allowed = policy.authorize(role, req.method.toUpperCase(), path);
    if (!allowed) {
      throw new Error('Operation is not allowed');
    }
  },
  strategy: () => {
    return process.env.NODE_ENV === 'test'
      ? auth.strategies.symJWT({
          privateKey: process.env.JWT_SECRET,
          algorithm: 'HS256',
        })
      : auth.strategies.auth0({
          apiAudience: process.env.AUTH0_API_AUDIENCE,
          jwksUri: `${process.env.AUTH0_BASE_URL}/.well-known/jwks.json`,
        });
  },
  verbose: process.env.AUTH_LOGGING === 'verbose',
});

const namespace = process.env.AUTH0_CLAIM_NAMESPACE;

module.exports = guard;
