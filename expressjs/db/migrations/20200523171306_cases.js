const { onUpdateTrigger } = require('../../knexfile');

exports.up = function(knex) {
  let createQuery = `
    DO $$ BEGIN
      CREATE TYPE state_type AS ENUM ('unpublished', 'staging', 'published');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;
    
    CREATE TABLE cases(
      id UUID PRIMARY KEY,
      state state_type NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) WITH (oids = false);
  `;
  return knex.raw(createQuery)
    .then(() => knex.raw(onUpdateTrigger('cases')));
};

exports.down = function(knex) {
  let dropQuery = `
    DROP TABLE if exists cases CASCADE;
    DROP TYPE if exists state_type;
  `;
  return knex.raw(dropQuery);
};
