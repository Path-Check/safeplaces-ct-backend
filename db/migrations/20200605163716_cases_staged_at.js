
exports.up = function(knex) {
  return knex.schema.table('cases', table => {
    table.timestamp('staged_at').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('cases', table => {
    table.dropColumn('staged_at');
  });
};
