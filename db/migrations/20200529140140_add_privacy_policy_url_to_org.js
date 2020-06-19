exports.up = function (knex) {
  return knex.schema.table('settings', table => {
    table.string('privacy_policy_url');
  });
};

exports.down = function (knex) {
  return knex.schema.table('settings', table => {
    table.dropColumn('privacy_policy_url');
  });
};
