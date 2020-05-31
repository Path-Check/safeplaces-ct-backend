
exports.up = function(knex) {
  return knex.schema.table('settings', table => {
    table.string('privacy_policy_url');
    table.boolean('completed_onboarding').default(false);
  });
};

exports.down = function(knex) {
  return knex.schema.table('settings', table => {
    table.dropColumn('privacy_policy_url');
    table.dropColumn('completed_onboarding');
  });
};
