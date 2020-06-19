
exports.up = function(knex) {
  return knex.schema.table('cases', table => {
    table.uuid('contact_tracer_id').references('users.id').onDelete('SET NULL')
  });
};

exports.down = function(knex) {
  return knex.schema.table('cases', table => {
    table.dropColumn('contact_tracer_id');
  });
};
