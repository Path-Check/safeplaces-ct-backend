var knex = require('../knex.js');

function Organizations() {
  return knex('organizations');
}

// *** queries *** //

function findOne(filter){
  return Organizations().where(filter).first().then((row) => row);
}

module.exports = {
  findOne: findOne
};
