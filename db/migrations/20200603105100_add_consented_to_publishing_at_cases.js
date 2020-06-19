exports.up = function (knex) {
  return knex.schema.table('cases', table => {
    table.timestamp('consented_to_publishing_at');
  });
};

exports.down = function (knex) {
  return knex.schema.table('cases', table => {
    table.dropColumn('consented_to_publishing_at');
  });
};
