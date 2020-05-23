const { onUpdateTrigger } = require('../../knexfile');

exports.up = function(knex) {
  return knex.schema
    .createTable('trails', table => {
      table.increments('id').primary();
      table.string('redacted_trail_id').notNullable();
      table.uuid('case_id').references('id').inTable('cases').onDelete('CASCADE');
      table.uuid('user_id').notNullable();
      table.uuid('organization_id').notNullable();
      table.specificType('coordinates', 'geometry(point, 4326)');
      table.timestamp('time');
      table.timestamps(true, true);
    })
    .then(() => knex.raw(onUpdateTrigger('trails')));
};

exports.down = function(knex) {
  let dropQuery = `DROP TABLE trails`;
  return knex.raw(dropQuery);
};
