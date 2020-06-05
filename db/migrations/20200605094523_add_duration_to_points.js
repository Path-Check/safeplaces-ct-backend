
exports.up = function(knex) {
  return knex.schema.table('points', table => {
    table.integer('duration').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('points', table => {
    table.dropColumn('duration');
  });
};
