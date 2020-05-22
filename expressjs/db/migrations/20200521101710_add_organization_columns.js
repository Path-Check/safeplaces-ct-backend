exports.up = function(knex) {
  return knex.schema.table('organizations', function(table) {
    table.string('informationWebsiteURL');
    table.string('referenceWebsiteURL');
    table.string('apiEndpoint');
    table.json('regionCoordinates');
    table.integer('numberOfDaysToRetainRecords');
    table.string('notificationThreshold');
  });
};

exports.down = function(knex) {
  return knex.schema.table('organizations', function(table) {
    table.dropColumn('informationWebsiteURL');
    table.dropColumn('referenceWebsiteURL');
    table.dropColumn('apiEndpoint');
    table.dropColumn('regionCoordinates');
    table.dropColumn('numberOfDaysToRetainRecords');
    table.dropColumn('notificationThreshold');
  });
};