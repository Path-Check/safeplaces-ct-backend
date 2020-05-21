
// Leaving this here short term for reference.

// const bcrypt = require('bcrypt');
// const express = require('express');
// const jwtSecret = require('../config/jwtConfig');
// const jwt = require('jsonwebtoken');
// const passport = require('passport');
// const router = express.Router();

// const JWTstrategy = require('passport-jwt').Strategy;
// const ExtractJWT = require('passport-jwt').ExtractJwt;

// const organizations = require('../db/models/organizations');
// const publications = require('../db/models/publications');
// const trails = require('../db/models/trails');
// const users = require('../db/models/users');

// const LocalStrategy = require('passport-local').Strategy;

// // *** POST /login user *** //
// router.post('/login',	function(req, res, next) {
//   passport.authenticate('local', function(err, user, info) {
//     if (err) {
//       return done(err);
//     }
//     else if (user) {
//       users.findOne({username: req.body.username}).then((user) => {
//         const token = jwt.sign(
//           {
//             sub: user.username,
//             iat: ~~(Date.now() / 1000),
//             exp: ~~(Date.now() / 1000) + (parseInt(process.env.JWT_EXP) || (1 * 60 * 60)) // Default expires in an hour
//           },
//           jwtSecret.secret
//         );
//         res.status(200).json({
//           token: token,
//           maps_api_key: user.maps_api_key
//         });
//       }).catch((err) => {
//         return done(err);
//       });
//     }
//     else{
//       res.status(info.status).json({message: info.message});
//     }
//   })(req, res, next);
// });

// // *** GET health *** //
// router.get('/health', function(req, res) {
//   res.status(200).json({
//     message: 'All Ok!'
//   });
// });

// function formatRedactedTrailData(redactedTrailRecords) {
//   let redactedTrailData = {};
//   if (Array.isArray(redactedTrailRecords)) {
//     let redactedTrail = trails.getRedactedTrailFromRecord(redactedTrailRecords);
//     redactedTrailData = {
//       identifier: redactedTrailRecords[0].redacted_trail_id,
//       organization_id: redactedTrailRecords[0].organization_id,
//       trail: redactedTrail,
//       user_id: redactedTrailRecords[0].user_id
//     }
//   }
//   return redactedTrailData;
// }

// // *** GET all redacted trails *** //
// router.get('/redacted_trails', passport.authenticate('jwt', { session: false }), function(req, res) {
//   let redactedTrailsResponse = {};
//   trails.getAll().then((redactedTrails) => {
//     let redactedTrailsList = [];

//     // Map all redactedTrails by redacted trail 'identifier'
//     // i.e., Groups all trail points belonging to one 'identifier'
//     // into a trail array.
//     let redactedTrailsMap = redactedTrails.reduce(function (r, a) {
//       r[a.redacted_trail_id] = r[a.redacted_trail_id] || [];
//       r[a.redacted_trail_id].push(a);
//       return r;
//     } , Object.create(null));

//     // Make the Map with 'identifier' as key into the final
//     // list format with:
//     // [
//     //   {
//     //     identifier: '',
//     //     organization_id: '',
//     //     trail: [],
//     //     user_id: ''
//     //   }, ...
//     // ]
//     Object.keys(redactedTrailsMap).forEach((key, index) => {
//       let element = redactedTrailsMap[key];
//       redactedTrailsList.push(formatRedactedTrailData(element));
//     });

//     // Populate organization information in response
//     organizations.findOne({id: req.user.organization_id}).then((organization) => {
//       redactedTrailsResponse = {
//         organization: {
//           organization_id : organization.id,
//           authority_name : organization.authority_name,
//           info_website : organization.info_website,
//           safe_path_json : organization.safe_path_json
//         },
//         data: redactedTrailsList
//       };
//       res.status(200).json(redactedTrailsResponse);
//     }).catch((err) => {
//       //TODO: introduce logger
//       console.log(err);
//       res.status(500).json({message: 'Internal Server Error'})
//     });
//   }).catch((err) => {
//     //TODO: introduce logger
//     console.log(err);
//     res.status(500).json({message: 'Internal Server Error'})
//   });
// });

// // *** POST redacted trail *** //
// router.post('/redacted_trail', passport.authenticate('jwt', { session: false }), function(req, res) {
//     let redactedTrailReturnData = {};
//     if (Array.isArray(req.body.trail) && req.body.trail.length) {
//       trails.insertRedactedTrailSet(
//           req.body.trail,
//           req.body.identifier,
//           req.user.organization_id,
//           req.user.id
//         ).then((redactedTrailRecords) => {
//           if (Array.isArray(redactedTrailRecords)) {
//             redactedTrailReturnData = {
//               data: formatRedactedTrailData(redactedTrailRecords),
//               success: true
//             };
//           }
//           else {
//             res.status(500).json({message: 'Internal Server Error'});
//           }
//         res.status(200).json(redactedTrailReturnData);
//       }).catch((err) => {
//         //TODO: introduce logger
//         console.log(err);
//         res.status(500).json({message: 'Internal Server Error'});
//       });
//     }
//     else {
//       res.status(400).json({message: 'Trail can not be empty.'});
//     }
//   }
// );

// // *** GET an organisation's safe paths *** //
// router.get('/safe_path/:organization_id', function(req, res) {
//   let safePathsResponse = {};

//   publications.findLastOne({organization_id: req.params.organization_id})
//     .then((publicationRecord) => {

//       if (publicationRecord) {
//         safePathsResponse.publish_date = publicationRecord.publish_date.getTime()/1000;
//       }
//       else {
//         return res.status(204).send('');
//       }

//       let timeInterval = {
//         start_date: publicationRecord.start_date.getTime()/1000,
//         end_date: publicationRecord.end_date.getTime()/1000
//       }

//       trails.findInterval(timeInterval).then((redactedTrailRecords) => {
//         let intervalTrails = trails.getRedactedTrailFromRecord(redactedTrailRecords);

//         organizations.findOne({id: req.params.organization_id}).then((organization) => {

//           safePathsResponse.authority_name = organization.authority_name;
//           safePathsResponse.concern_points = intervalTrails;
//           safePathsResponse.info_website = organization.info_website;

//           res.status(200).json(safePathsResponse);
//         }).catch((err) => {
//           //TODO: introduce logger
//           console.log(err);
//           res.status(500).json({message: 'Internal Server Error'});
//         });
//       }).catch((err) => {
//         //TODO: introduce logger
//         console.log(err);
//         res.status(500).json({message: 'Internal Server Error'});
//       });
//     }).catch((err) => {
//       //TODO: introduce logger
//       console.log(err);
//       res.status(500).json({message: 'Internal Server Error'});
//     });
// });

// // *** POST safe paths *** //
// router.post('/safe_paths',
//   passport.authenticate('jwt', { session: false }), function(req, res) {
//     let safePathsResponse = {};
//     let safePath = {};

//     safePathsResponse.organization_id = req.user.organization_id;
//     safePathsResponse.user_id = req.user.id;
//     safePath.publish_date = req.body.publish_date;

//     // Constuct a publication record before inserting
//     let publication = {};
//     publication.start_date = req.body.start_date;
//     publication.end_date = req.body.end_date;
//     publication.publish_date = req.body.publish_date;
//     publication.user_id = req.user.id;
//     publication.organization_id = req.user.organization_id;

//     // Construct a organization record before updating

//     let organization = {};
//     organization.id = req.user.organization_id;
//     organization.authority_name = req.body.authority_name;
//     organization.info_website = req.body.info_website;
//     organization.safe_path_json = req.body.safe_path_json;

//     // Construct a timeSlice record for getting a trail within this time interval
//     let timeSlice = {};
//     timeSlice.start_date = req.body.start_date;
//     timeSlice.end_date = req.body.end_date;

//     publications.insert(publication).then((publicationRecords) => {

//       safePathsResponse.datetime_created = new Date(publicationRecords[0].created_at).toString();

//       organizations.update(organization).then((organizationRecords) => {

//         safePath.authority_name = organizationRecords[0].authority_name;
//         safePath.info_website = organizationRecords[0].info_website;
//         safePath.safe_path_json = organizationRecords[0].safe_path_json;

//         trails.findInterval(timeSlice).then((intervalTrail) => {

//           let intervalPoints = [];
//           intervalPoints = trails.getRedactedTrailFromRecord(intervalTrail);
//           safePath.concern_points = intervalPoints;
//           safePathsResponse.safe_path = safePath;

//           res.status(200).json(safePathsResponse);
//         }).catch((err) => {
//           res.status(500).json({message: err});
//         }); // trails
//       }).catch((err) => {
//         res.status(404).json({message: err});
//       }) // organization

//     }).catch((err) => {
//       res.status(500).json({message: err});
//     }); // publication
// });

// module.exports = router;

// passport.use(
//   'local',
//   new  LocalStrategy({
//     passReqToCallback : true,
//     session : false
//   }, (req, username, password, done) => {
//     loginAttempt();
//     async function loginAttempt() {
//       try{
//         users.findOne({username: username}).then((loginUser) => {
//           if(loginUser == null){
//             //TODO: log error
//             return done(null, false, {status: 401, message: 'Invalid credentials.'});
//           }
//           else{
//             bcrypt.compare(password, loginUser.password, function(err, check) {
//               if (err){
//                 //TODO: log error
//                 return done();
//               }
//               else if (check){
//                 return done(null, [{username: loginUser.username}]);
//               }
//               else{
//                 return done(null, false, {status: 401, message: 'Invalid credentials.'});
//               }
//             });
//           }
//         }).catch((err) => {
//           return done(err);
//         });
//       }
//       catch(e){throw (e);}
//     }
//   })
// );

// const opts = {
//   jwtFromRequest: ExtractJWT.fromHeader("authorization"),
//   secretOrKey: jwtSecret.secret,
// };

// passport.use(
//   'jwt',
//   new JWTstrategy(opts, (jwt_payload, done) => {
//     try {
//       const isExpired = (jwt_payload.exp - ~~(Date.now()/1000)) < 0;
//       if (isExpired){
//         return done(new Error('Token Expired'), false);
//       }
//       users.findOne({username: jwt_payload.sub}).then(user => {
//         if (user) {
//           // note the return removed with passport JWT - add this return for passport local
//           done(null, user);
//         } else {
//           done(new Error('User not found!'), false);
//         }
//       });
//     } catch (err) {
//       done(err);
//     }
//   }),
// );

// passport.serializeUser(function(user, done) {
// 	done(null, user);
// });

// passport.deserializeUser(function(user, done) {
// 	done(null, user);
// });		
