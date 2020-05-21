var knex = require('../knex.js');

function Publications() {
  return knex('publications');
}

// *** queries *** //

function findOne(filter){
  return Publications().where(filter).first().then(row => row);
}

function findLastOne(filter){
  return Publications().where(filter).orderBy(
    'created_at', 'desc').first().then(row => row);
}

function insert(publication){
  publication.start_date = new Date(publication.start_date * 1000);
  publication.end_date = new Date(publication.end_date * 1000);
  publication.publish_date = new Date(publication.publish_date * 1000);
  return Publications().insert(publication).returning('*');
}

function deleteTable(){
  return Publications().del();
}

module.exports = {
  findOne: findOne,
  findLastOne: findLastOne,
  insert: insert,
  deleteTable: deleteTable
};
