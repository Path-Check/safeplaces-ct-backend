exports.up = function (knex) {
  let createQuery = `CREATE EXTENSION POSTGIS;`;
  return knex.raw(createQuery);
};

exports.down = function (knex) {
  let deleteQuery = `DROP EXTENSION POSTGIS;`;
  return knex.raw(deleteQuery);
};
