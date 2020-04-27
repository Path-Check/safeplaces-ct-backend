var knex = require('../knex.js');

function Users() {
  return knex('users');
}

// *** queries *** //

function findOne(filter){
  return Users().where(filter).first().then((row) => row);
}

module.exports = {
  findOne: findOne
};
