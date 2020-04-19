var express = require('express');
var router = express.Router();

var queries = require('../db/queries');

// *** GET index *** //
router.get('/', function(req, res, next) {
  res.send('send index');
});

// *** GET all users *** //
router.get('/users', function(req, res, next) {
  queries.getAll()
  .then(function(users) {
    res.status(200).json(users);
  })
  .catch(function(error) {
    next(error);
  });
});


module.exports = router;
