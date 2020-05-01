const { onUpdateTrigger } = require('../../knexfile');

exports.up = function(knex, Promise) {
  return knex.schema.createTable("trails", table => {
      table.increments("id").primary();
      table.string("redacted_trail_id").notNullable();
      table.uuid("user_id").notNullable();
      table.uuid("organization_id").notNullable();
      table.specificType("coordinates", "geometry(point, 4326)");
      table.timestamp("time");
      table.timestamps(true, true);
    }).then(() => knex.raw(onUpdateTrigger('trails')))
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE trails`;
  return knex.raw(dropQuery);
};