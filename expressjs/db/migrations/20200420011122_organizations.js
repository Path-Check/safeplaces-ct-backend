const { onUpdateTrigger } = require('../../knexfile');

exports.up = function(knex, Promise) {
  let createQuery = `CREATE TABLE organizations(
    id UUID NOT NULL,
    authority_name VARCHAR(128),
    info_website VARCHAR(256),
    safe_path_json VARCHAR(256),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT org_pkey PRIMARY KEY(id)
  ) WITH (oids = false)`;
  return knex.raw(createQuery).then(() => knex.raw(onUpdateTrigger('organizations')));
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE organizations`;
  return knex.raw(dropQuery);
};