var knex = require('../knex.js');

function Users() {
  return knex('users');
}

// *** queries *** //

function getAll() {
  return Users().select();
}

function findUser(username){
  return Users().select({username: username});
}


module.exports = {
  getAll: getAll,
  findUser: findUser
};
