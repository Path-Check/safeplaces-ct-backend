FROM node:13.13.0 AS build-env
WORKDIR /app
ENV NODE_ENV=development
ADD . $WORKDIR
RUN yarn install

FROM node:13.13.0
COPY --from=build-env /app /app 
WORKDIR /app
CMD ["yarn", "start"]

