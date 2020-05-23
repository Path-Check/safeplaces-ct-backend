
exports.up = function(knex) {
  return knex.schema.table('organizations', function(table) {
    table.dropColumn('notificationThreshold');
    table.integer('notificationThresholdPercent');
    table.integer('notificationThresholdCount');
  });
};

exports.down = function(knex) {
  return knex.schema.table('organizations', function(table) {
    table.string('notificationThreshold');
    table.dropColumn('notificationThresholdPercent');
    table.dropColumn('notificationThresholdCount');
  });
};
