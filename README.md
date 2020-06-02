
# Safeplaces Backend Examples

This repository holds an example backend for [Safeplaces API specification](https://github.com/Path-Check/safeplaces-frontend/blob/dev_mvp/Safe-Places-Server.md).

Safeplaces is a toolkit for public health, built on top of data shared by users of [Private Kit](https://github.com/tripleblindmarket/covid-safe-paths).

[Safeplaces Frontend](https://github.com/Path-Check/safeplaces-frontend) is an example client for these backends.

## Project Status

[![Project Status: WIP – The project is still under development and will reach a Minimum Viable Product stage soon.](https://www.repostatus.org/badges/latest/wip.svg)](https://www.repostatus.org/#wip)

The project is still under development and will reach a Minimum Viable Product (MVP) stage soon.  
*Note*: There can be breaking changes to the developing code until the MVP is released.

## Google Cloud Storage (GCS)

To get tests to fully run you will need to add GCS credentials.  These credentials go into the environment variables. If these environment variables are not set, then it will simply write to disc so that the tests pass.

```
GOOGLE_APPLICATION_CREDENTIALS='google_service_account.json'
GOOGLE_CLOUD_PROJECT=something
GCLOUD_STORAGE_BUCKET=somethingOrOther
```

## Deployment

### Deploy in local machine

*Note*:
1. The installation assumes you have already installed Postgres DB in your local environment listening for connections at port 5432.
2. Your Postgres instance should listen to '*' instead of 'localhost' by setting the `listen_addresses` parameter, [this setting can be found in your pgconfig file](https://www.postgresql.org/docs/current/runtime-config-connection.html).

Clone this repository

```
cd safeplaces-backend/expressjs
```

#### Install Package Manager

Steps to install NVM are documented [in the nvm repository](https://github.com/nvm-sh/nvm#installing-and-updating).

Install npm using nvm

```
nvm install 13.1.0
nvm use 13.1.0
npm install
```

#### Setup Environment

Refer [.env.template](.env.template) for environment variables to be exported to your environment.

#### Setup LDAP Server
The basic, included LDAP server is to be used for testing purposes only.
It is not meant for production use.

Please see the OpenLDAP implementations for production-ready servers.

To run the server:
```
cd ldapjs/
npm install
npm start
```

#### Setup Database

1. Create databases and users mentioned exported in your environment.
1. Grant database user superuser privilege to the database to create POSTGIS extension and setup other tables. Reduce this privilege later to just create and modify tables or tuples in this database after you run the migration for the first time.
1. Install [PostGIS extension](https://postgis.net/install/).

#### Knex migrations and seed the database

Install Knex globally

```
npm install knex -g
```

Run migrations

```
knex migrate:latest --env test
knex migrate:latest --env development
```

Seed the database

```
knex seed:run --env test
knex seed:run --env development
```

#### Mocha unit tests

Install mocha globally.

```
npm install mocha -g
```

Run testing through mocha to see if unit tests pass

```
mocha
```

### Deploy using Docker

*Note*:  
1. The installation assumes you have already installed Postgres DB in your local environment listening for connections at port 5432.
2. Your Postgres instance should listen to '*' instead of 'localhost' by setting the `listen_addresses` parameter, [this setting can be found in your pgconfig file](https://www.postgresql.org/docs/current/runtime-config-connection.html).
3. Your `pg_hba.conf` should have a rule added for `host all all <docker-subnet> md5`. Replace `<docker-subnet>` with the actual CIDR for your docker installation's subnet. Note that `172.18.0.0/16` is usually the default.

Clone this repository

```
cd safeplaces-backend/expressjs
```

#### Build Dockerfile

```
docker build -t safeplaces-backend-expressjs .
```

#### Run Dockerfile

```
docker run --rm --name safeplaces-expressjs --env-file=.env -p 3000:3000 safeplaces-backend-expressjs
```

*Note*: sample env file can be found at .env.template`.

#### Deploy via docker-compose

 *Using docker-compose will bring a postgres server along with the application container* 
 
Ensure to create application Environment variables  file .env from .env.template

Ensure to create Postgres Environment variables file  .database.env from .database.env.template

#### Run the following:

```
docker-compose build
docker-compose up
```

### Testing Your Deployment

Run:

```
curl http://localhost:3000/health
```

Should respond with:

```
{
  "message": "All Ok!"
}
```