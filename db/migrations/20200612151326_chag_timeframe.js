exports.up = function (knex) {
  return knex.schema.table('settings', table => {
    table.dropColumn('notification_threshold_count');
    table.integer('notification_threshold_timeframe').defaultTo(30);
  });
};

exports.down = function (knex) {
  return knex.schema.table('organizations', table => {
    table.dropColumn('notification_threshold_timeframe');
    table.integer('notification_threshold_count').defaultTo(6);
  });
};
