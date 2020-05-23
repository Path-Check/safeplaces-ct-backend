const { onUpdateTrigger } = require('../../knexfile');

exports.up = function (knex) {
  return knex.schema
    .createTable('publications', table => {
      table.increments('id').primary();
      table.uuid('organization_id').notNullable();
      table.uuid('user_id').notNullable();
      table.timestamp('start_date').notNullable();
      table.timestamp('end_date').notNullable();
      table.timestamp('publish_date').notNullable();
      table.timestamps(true, true);
    })
    .then(() => knex.raw(onUpdateTrigger('publications')));
};

exports.down = function (knex) {
  let dropQuery = `DROP TABLE publications`;
  return knex.raw(dropQuery);
};
