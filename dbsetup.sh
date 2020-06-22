#!/bin/bash

spdl migrate:rollback --scope private --env $NODE_ENV

if [ $NODE_ENV = "development" ]; then
  spdl seed:run --scope private --env $NODE_ENV
fi

exec "$@"
