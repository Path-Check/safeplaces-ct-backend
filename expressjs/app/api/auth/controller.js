const jwt = require('jsonwebtoken');
const passport = require('../../../src/server/passport');
const users = require('../../../db/models/users');
const jwtSecret = require('../../../config/jwtConfig');

/**
 * @method login
 *
 * Login Check
 *
 */
exports.login = async (req, res, next) => {
  const { username } = req.body;

  try {
    passport.authenticate('local', async (err, user, info) => {
      if (err) {
        console.log('Error 1: ', err);
        res.status(404);
      } else if (user) {
        // TODO: We are making two calls here pulling the user...why?

        const foundUser = await users.findOne({ username });
        if (foundUser) {
          const token = jwt.sign(
            {
              sub: foundUser.username,
              iat: ~~(Date.now() / 1000),
              exp:
                ~~(Date.now() / 1000) +
                (parseInt(process.env.JWT_EXP) || 1 * 60 * 60), // Default expires in an hour
            },
            jwtSecret.secret,
          );
          res.status(200).json({
            token: token,
            maps_api_key: foundUser.maps_api_key,
          });
        }
      } else {
        res.status(info.status).json({ message: info.message });
      }
    })(req, res, next);
  } catch (e) {
    throw new Error('WTF!');
  }
};
