FROM node:13.13.0 AS build-env
WORKDIR /app
ENV NODE_ENV=development
ADD . $WORKDIR
RUN npm install

FROM node:13.13.0
COPY --from=build-env /app /app 
RUN npm install knex -g
ENTRYPOINT ["/app/dbsetup.sh"]
CMD ["npm", "start"]

