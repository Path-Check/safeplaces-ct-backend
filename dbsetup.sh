#!/bin/bash

knex --knexfile /app/knexfile.js migrate:latest --env $NODE_ENV

if [ $NODE_ENV = "development" ]; then
  knex --knexfile /app/knexfile.js seed:run --env $NODE_ENV
fi

exec "$@"
