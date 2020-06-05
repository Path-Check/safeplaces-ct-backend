
exports.up = function(knex) {
  return knex.schema.table('points', table => {
    table.uuid('durationMin').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('points', table => {
    table.dropColumn('durationMin');
  });
};
