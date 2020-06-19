exports.up = function (knex) {
  return knex.schema.table('cases', table => {
    table.timestamp('expires_at');
  });
};

exports.down = function (knex) {
  return knex.schema.table('cases', table => {
    table.dropColumn('expires_at');
  });
};
