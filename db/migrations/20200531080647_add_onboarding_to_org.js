
exports.up = function(knex) {
  return knex.schema.table('organizations', table => {
    table.boolean('completed_onboarding').default(false);
  });
};

exports.down = function(knex) {
  return knex.schema.table('organizations', table => {
    table.dropColumn('completed_onboarding');
  });
};
