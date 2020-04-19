const bcrypt = require('bcrypt');
var express = require('express');
const passport = require('passport');
var router = express.Router();

var users = require('../db/models/users');

const LocalStrategy = require('passport-local').Strategy;

// *** GET index *** //
router.get('/', function(req, res, next) {
  res.send('send index');
});

// *** GET all users *** //
router.get('/users', function(req, res, next) {
  users.getAll()
  .then(function(users) {
    res.status(200).json(users);
  })
  .catch(function(error) {
    next(error);
  });
});


router.post('/login',	passport.authenticate('local'), function(req, res) {
  req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
  res.status(200).json(res);
});

module.exports = router;

passport.use('local', new  LocalStrategy({passReqToCallback : true}, (req, username, password, done) => {
	loginAttempt();
	async function loginAttempt() {
		const client = await pool.connect()
		try{
      users.findUser(username).then((login_user) => {
				if(login_user.rows[0] == null){
          //TODO: show something logical
          console.log('Error no user found');
					return done(null, false);
        }
        else{
					bcrypt.compare(password, login_user.rows[0].password, function(err, check) {
						if (err){
              //TODO: show something logical
							console.log('Error while checking password');
							return done();
						}
						else if (check){
							return done(null, [{username: result.rows[0].username}]);
						}
						else{
              //TODO: show something logical
							console.log('Error wrong login details');
							return done(null, false);
						}
					});
				}
      }).catch((err) => {
        return done(err);
      })
		}
		catch(e){throw (e);}
	};
}))

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});		