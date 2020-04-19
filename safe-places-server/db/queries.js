var knex = require('./knex.js');

function Users() {
  return knex('users');
}

// *** queries *** //

function getAll() {
  return Users().select();
}


module.exports = {
  getAll: getAll
};
