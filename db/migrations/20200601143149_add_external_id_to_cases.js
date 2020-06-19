function enableUUIDExtension(knex) {
  return knex.raw(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
}

function buildExternalId(knex) {
    return knex.schema.table('cases', table => {
        table.string('external_id').unique().defaultTo(knex.raw("uuid_generate_v4()"));
    });
}

exports.up = function(knex) {
  return enableUUIDExtension(knex)
    .then(() => buildExternalId(knex))
};

exports.down = function(knex) {
  return knex.schema.table('cases', table => {
    table.dropColumn('external_id')
  });

};
