
exports.up = function(knex) {
  return knex.schema.table('trails', function(table) {
    table.string('hash')
  });
};

exports.down = function(knex) {
  return knex.schema.table('trails', function(table) {
    table.dropColumn('hash');
  });
};
