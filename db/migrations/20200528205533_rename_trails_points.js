const { onUpdateTrigger } = require('../../knexfile');

function dropTables(knex) {
  let dropQuery = `
    DROP TABLE if exists trails;
    DROP TABLE if exists points;
  `;
  return knex.raw(dropQuery);
}

function buildTrails(knex) {
  return knex.schema.createTable('trails', function (table) {
    table.increments('id').notNull().primary();
    table.integer('case_id').notNull().references('cases.id').onDelete('CASCADE');
    table.specificType('coordinates', 'geometry(point, 4326)');
    table.timestamp('time');
    table.string('hash');
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.timestamp('created_at').defaultTo(knex.fn.now())
  }).then(() => knex.raw(onUpdateTrigger('trails')));
}

function buildPoints(knex) {
  return knex.schema.createTable('points', function (table) {
    table.increments('id').notNull().primary();
    table.integer('case_id').notNull().references('cases.id').onDelete('CASCADE');
    table.specificType('coordinates', 'geometry(point, 4326)');
    table.timestamp('time');
    table.string('hash');
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.timestamp('created_at').defaultTo(knex.fn.now())
  }).then(() => knex.raw(onUpdateTrigger('points')));
}

exports.up = function (knex) {
  return dropTables(knex)
    .then(() => buildPoints(knex))
};

exports.down = function (knex) {
  return dropTables(knex)
    .then(() => buildTrails(knex))
};

