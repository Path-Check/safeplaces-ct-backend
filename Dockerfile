FROM node:13-alpine3.10
WORKDIR /app
ADD . $WORKDIR
RUN npm install
RUN npm install knex -g


