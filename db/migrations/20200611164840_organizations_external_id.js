
exports.up = function(knex) {
  return knex.schema.table('organizations', table => {
    table.uuid('external_id').unique();
  });
};

exports.down = function(knex) {
  return knex.schema.table('organizations', table => {
    table.dropColumn('external_id');
  });
};
