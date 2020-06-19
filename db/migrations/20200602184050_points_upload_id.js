exports.up = function (knex) {
  return knex.schema.table('points', table => {
    table.uuid('upload_id').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table('points', table => {
    table.dropColumn('upload_id');
  });
};
