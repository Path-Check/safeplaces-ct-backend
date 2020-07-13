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

module.exports = new auth.Enforcer({
  strategy: () => {
    return process.env.NODE_ENV === 'test' ? symJWTStrategy : auth0Strategy;
  },
  userGetter: id => userService.findOne({ idm_id: id }),
});
