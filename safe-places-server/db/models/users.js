var knex = require('../knex.js');

function Users() {
  return knex('users');
}

// *** queries *** //

function getAll() {
  return Users().select();
}

function findOne(filter){
  return Users().where(filter).first().then((row) => row);
}


module.exports = {
  getAll: getAll,
  findOne: findOne
};
