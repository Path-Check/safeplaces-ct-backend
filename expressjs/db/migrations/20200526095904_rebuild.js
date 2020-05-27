const { onUpdateTrigger } = require('../../knexfile');

function dropTables(knex) {
  let dropQuery = `
    DROP TABLE if exists publications;
    DROP TABLE if exists trails;
    DROP TABLE if exists users;
    DROP TABLE if exists cases;
    DROP TYPE if exists state_type;
    DROP TABLE if exists organizations;
  `;
  return knex.raw(dropQuery);
}

function buildOrganization(knex) {
  return knex.schema.createTable('organizations', function (table) {
    table.uuid('id').notNull().primary();
    table.string('name')
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
  }).then(() => knex.raw(onUpdateTrigger('organizations')));
}

function buildSettings(knex) {
  return knex.schema.createTable('settings', function (table) {
    table.uuid('id').notNull().primary();
    table.uuid('organization_id').notNull().references('organizations.id').onDelete('CASCADE');
    table.string('info_website_url');
    table.string('reference_website_url');
    table.string('api_endpoint_url');
    table.json('region_coordinates');
    table.integer('notification_threshold_percent').defaultTo(66);
    table.integer('notification_threshold_count').defaultTo(6);
    table.integer('chunking_in_seconds').defaultTo(43200);
    table.integer('days_to_retain_records').defaultTo(30);
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
  }).then(() => knex.raw(onUpdateTrigger('settings')));
}

function buildUsers(knex) {
  return knex.schema.createTable('users', function (table) {
    table.uuid('id').notNull().primary();
    table.uuid('organization_id').notNull().references('organizations.id').onDelete('CASCADE');
    table.string('username', 64);
    table.string('email', 128);
    table.string('password', 60);
    table.string('maps_api_key');
    table.boolean('is_admin');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
  }).then(() => knex.raw(onUpdateTrigger('users')));
  
}

function buildPublications(knex) {
  return knex.schema.createTable('publications', function (table) {
    table.increments('id').notNull().primary();
    table.uuid('organization_id').notNull().references('organizations.id').onDelete('CASCADE');
    table.timestamp('start_date').notNullable();
    table.timestamp('end_date').notNullable();
    table.timestamp('publish_date').notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.timestamp('created_at').defaultTo(knex.fn.now())
  }).then(() => knex.raw(onUpdateTrigger('publications')));
}

function buildCases(knex) {
  let createQuery = `
    DO $$ BEGIN
      CREATE TYPE state_type AS ENUM ('unpublished', 'staging', 'published');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;
    
    CREATE TABLE cases(
      id UUID PRIMARY KEY,
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      publication_id INT REFERENCES publications(id) ON DELETE CASCADE,
      state state_type NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) WITH (oids = false);
  `;
  return knex.raw(createQuery)
    .then(() => knex.raw(onUpdateTrigger('cases')));
}

function buildTrails(knex) {
  return knex.schema.createTable('trails', function (table) {
    table.increments('id').notNull().primary();
    table.uuid('case_id').notNull().references('cases.id').onDelete('CASCADE');
    table.specificType('coordinates', 'geometry(point, 4326)');
    table.timestamp('time');
    table.string('hash');
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.timestamp('created_at').defaultTo(knex.fn.now())
  }).then(() => knex.raw(onUpdateTrigger('trails')));
}

exports.up = function (knex) {
  return dropTables(knex)
    .then(() => buildOrganization(knex))
    .then(() => buildSettings(knex))
    .then(() => buildUsers(knex))
    .then(() => buildPublications(knex))
    .then(() => buildCases(knex))
    .then(() => buildTrails(knex))
};

exports.down = function () {
  // Nothing to really do...
};

