#!/bin/bash
knex migrate:latest --env test
knex migrate:latest --env development

knex seed:run --env test
knex seed:run --env development
