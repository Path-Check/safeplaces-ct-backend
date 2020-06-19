exports.up = function (knex) {
  return knex.schema.table('publications', table => {
    table.dropColumn('start_date');
    table.dropColumn('end_date');
  });
};

exports.down = function (knex) {
  return knex.schema.table('publications', table => {
    table.timestamp('start_date').notNullable();
    table.timestamp('end_date').notNullable();
  });
};
