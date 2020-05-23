
exports.up = function(knex) {
  return knex.schema.table('organizations', function(table) {
    table.dropColumn('notificationThreshold');
    table.integer('notificationThresholdPercent').defaultTo(66);
    table.integer('notificationThresholdCount').defaultTo(6);
    table.integer('chunkingInSeconds').defaultTo(43200);
  });
};

exports.down = function(knex) {
  return knex.schema.table('organizations', function(table) {
    table.string('notificationThreshold');
    table.dropColumn('notificationThresholdPercent');
    table.dropColumn('notificationThresholdCount');
    table.dropColumn('chunkingInSeconds');
  });
};
