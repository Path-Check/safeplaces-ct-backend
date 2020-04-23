FROM node:13.1.0-alpine AS build-env
ADD . /app
WORKDIR /app
RUN npm install

FROM node:13.1.0-alpine
COPY --from=build-env /app /app
WORKDIR /app
CMD ["node", "./bin/www"]
