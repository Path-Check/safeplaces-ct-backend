const { onUpdateTrigger } = require('../../knexfile');

exports.up = function(knex, Promise) {
  let createQuery = `CREATE TABLE users(
    id UUID NOT NULL,
    username VARCHAR(64),
    email VARCHAR(128),
    password VARCHAR(60),
    maps_api_key TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY(id)
  ) WITH (oids = false)`;
  return knex.raw(createQuery).then(() => knex.raw(onUpdateTrigger('users')));
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE users`;
  return knex.raw(dropQuery);
};