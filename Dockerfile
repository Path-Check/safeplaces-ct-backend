FROM node:13.13.0 AS build-env
WORKDIR /app
ENV NODE_ENV=development
ADD . $WORKDIR
RUN npm install

FROM node:13.13.0
COPY --from=build-env /app /app
WORKDIR /app
ADD wait-for.sh /wait-for.sh
RUN npm install -g knex
RUN npm install -g @sublet/data-layer --unsafe-perm
ENTRYPOINT ["/app/dbsetup.sh"]
CMD ["npm", "start"]