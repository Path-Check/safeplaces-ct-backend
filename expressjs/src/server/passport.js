const bcrypt = require('bcrypt');
const passport = require('passport');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const jwtSecret = require('../../config/jwtConfig');
const users = require('../../db/models/users');

const LocalStrategy = require('passport-local').Strategy;

passport.use(
  'local',
  new  LocalStrategy({
    passReqToCallback : true,
    session : false
  }, (req, username, password, done) => {
    loginAttempt();
    async function loginAttempt() {
      try{
        users.findOne({username: username}).then((loginUser) => {
          if(loginUser == null){
            //TODO: log error
            return done(null, false, {status: 401, message: 'Invalid credentials.'});
          }
          else{
            bcrypt.compare(password, loginUser.password, function(err, check) {
              if (err){
                //TODO: log error
                return done();
              }
              else if (check){
                return done(null, [{username: loginUser.username}]);
              }
              else{
                return done(null, false, {status: 401, message: 'Invalid credentials.'});
              }
            });
          }
        }).catch((err) => {
          return done(err);
        });
      }
      catch(e){throw (e);}
    }
  })
);

const opts = {
  jwtFromRequest: ExtractJWT.fromHeader("authorization"),
  secretOrKey: jwtSecret.secret,
};

passport.use(
  'jwt',
  new JWTstrategy(opts, (jwt_payload, done) => {
    try {
      const isExpired = (jwt_payload.exp - ~~(Date.now()/1000)) < 0;
      if (isExpired){
        return done(new Error('Token Expired'), false);
      }
      users.findOne({username: jwt_payload.sub}).then(user => {
        if (user) {
          // note the return removed with passport JWT - add this return for passport local
          done(null, user);
        } else {
          done(new Error('User not found!'), false);
        }
      });
    } catch (err) {
      done(err);
    }
  }),
);

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});		

module.exports = passport