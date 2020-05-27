#!/bin/bash

# knex --knexfile /app/knexfile.js migrate:latest --env test
knex --knexfile /app/knexfile.js migrate:latest --env development

# knex --knexfile /app/knexfile.js seed:run --env test
knex --knexfile /app/knexfile.js seed:run --env development

exec "$@"
