# Safeplaces Backend API

This repository holds an example backend for [Safeplaces API specification](https://github.com/Path-Check/safeplaces-backend/blob/dev/oas3.yaml).

Safeplaces is a toolkit for public health, built on top of data shared by users of [Private Kit](https://github.com/tripleblindmarket/covid-safe-paths).

[Safeplaces Frontend](https://github.com/Path-Check/safeplaces-frontend) is an example client for these backends.

## Project Status

[![Project Status: WIP – The project is still under development and will reach a Minimum Viable Product stage soon.](https://www.repostatus.org/badges/latest/wip.svg)](https://www.repostatus.org/#wip)

The project is still under development and will reach a Minimum Viable Product (MVP) stage soon.  
*Note*: There can be breaking changes to the developing code until the MVP is released.

## Accessing Uploaded Data From Clients

[Safeplaces Ingest](https://github.com/Path-Check/safeplaces-backend-ingest) is a supporting backend service used by clients (including the SafePaths app) to upload data, which is then ingested by this service. In order to interact with the upload database, the following environment variables must be set:

```
DB_HOST_PUB=upload_db_host
DB_NAME_PUB=upload_db_name
DB_USER_PUB=upload_db_user
DB_PASS_PUB=upload_db_password
```

## Publishing Files

Files can be published to either Google Cloud Storage (GCS) or AWS Simple Storage Service (S3). This preference is set via an environment variable. If not set, tests will default to local storage (write to disk) to pass. This variable is required in a production environment.

```
PUBLISH_STORAGE_TYPE=(gcs|aws)
```

#### Google Cloud Storage (GCS)

The following environment variables are required to upload files to GCS:

```
PUBLISH_STORAGE_TYPE=gcs
GOOGLE_APPLICATION_CREDENTIALS='google_service_account.json'
GOOGLE_CLOUD_PROJECT=something
GCLOUD_STORAGE_BUCKET=somethingOrOther
```

#### AWS Simple Storage Service (S3)

The following environment variables are required to upload files to AWS:

```
PUBLISH_STORAGE_TYPE=aws
S3_BUCKET=bucket-name
S3_REGION=region-name
S3_ACCESS_KEY=something
S3_SECRET_KEY=something-secret
```

## Data Layer

The data base, [Safeplaces Data Layer](https://github.com/Path-Check/safeplaces-data-layer), has been decoupled from the main repo and now sits in a library that can be pulled into any micro service or API.  Both Public an Private database are managed out of this library.

Additionally, this can be forked for functionality, or replaced entirely with a data layer for your choosing.

#### CLI

Due to the nature of database management we have built in a small CLI that will allow you to run seeds and migrations. To install enter the following.

This needs to be installed globaly so run the following command.

`npm i -g @sublet/data-layer`

For more information see the CLI portion of the [Safeplaces Data Layer](https://github.com/Path-Check/safeplaces-data-layer#cli) library.

## Local Development

*Note*:
1. The installation assumes you have already installed Postgres DB in your local environment listening for connections at port 5432.
2. Your Postgres instance should listen to '*' instead of 'localhost' by setting the `listen_addresses` parameter, [this setting can be found in your pgconfig file](https://www.postgresql.org/docs/current/runtime-config-connection.html).

Clone this repository

```
cd safeplaces-backend
```

To work locally with the data-layer library, clone it to your computer and then reference it locally using the following command.

```
npm install --save file:../safeplaces-data-layer
```

__NOTE:__ Where you clone it might be very different than the path below.

Once installed it should show up in the package.json file like below.

```
"@sublet/data-layer": "file:../safeplaces-data-layer"
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

#### Setup Database

1. Create the database exported in your environment.
```
createdb safeplaces
```
1. Create the user exported in your environment.
```
psql=# CREATE USER safepaths_user
```
1. Grant database user superuser privilege to the database to create POSTGIS extension and setup other tables. Reduce this privilege later to just create and modify tables or tuples in this database after you run the migration for the first time.
```
ALTER USER safepaths_user WITH SUPERUSER
```
After migration:
```
ALTER USER safepaths_user WITH NOSUPERUSER
```
1. Install [PostGIS extension](https://postgis.net/install/).

#### Knex migrations and seed the database

Install Safe Places Data Layer globally

```
npm i -g @sublet/data-layer
```

Run migrations

```
npm run migrate:up
```

Seed the database

```
npm run seed:dev
```

#### Mocha unit tests

Install mocha globally.

```
npm install mocha -g
```

Run tests to ensure they pass

```
npm test
```

#### Start the server

```
npm start
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

## Production and Staging Deployments
This section of the readme will detail configuration of deployed environments. In our sample application, we support the deployment of a staging and production version of the application.

#### Staging
The staging deployment is based off of the `staging` branch. This environment is used by QA, product, and development teams to validate functionality before releasing to the general public.

##### Hosted Services
Frontend : [https://safeplaces.extremesolution.com/](https://safeplaces.extremesolution.com/)

Backend API (this repo) : [https://zeus.safeplaces.extremesolution.com](https://zeus.safeplaces.extremesolution.com/)

Ingest Service API : [https://hermes.safeplaces.extremesolution.com/](https://hermes.safeplaces.extremesolution.com/)

#### Production
The production deployment is based off of the `master` branch. This environment is a production version of the SafePlaces application(s).

##### Hosted Services
Frontend: [https://spl.extremesolution.com/](https://spl.extremesolution.com/)

Backend API (this repo): [https://yoda.spl.extremesolution.com/](https://spl.extremesolution.com/)

Ingest Service: [https://obiwan.spl.extremesolution.com/](https://spl.extremesolution.com/)

### Database Configuration
Databases for the staging and production version of the application will be configured similarly. Each environment will use its own database.

Both the Backend API (this repo) and the Ingest service make use of their own PostgreSQL databases. The Backend API will need the ability to read and write to both its database and the Ingest database. The following environment variables will need to be set on the server hosting the Backend API:
```
# Private Database Configuration Environment Variables (Backend API Database)
DB_HOST (IP/URL of where database is hosted)
DB_NAME (Name of database)
DB_USER (Name of appropriatly configured user)
DB_PASS (Password for corresponding user)

# Public Database Config Environment Variables (Ingest API Database)
DB_HOST_PUB (IP/URL of where database is hosted)
DB_NAME_PUB (Password for corresponding user)
DB_USER_PUB (Name of appropriatly configured user)
DB_PASS_PUB (Password for corresponding user)
```

### Environment Variables
There are a handful of other environment variables that are required to be set on the server beyond those mentioned in the previous sections. A full list of environment variables and sample values can be found [here](https://github.com/Path-Check/safeplaces-backend/blob/dev/.env.template).

#### Cloud Document Storage
The sample application supports pushing published files to AWS S3 or Google Cloud Storage (GCS) buckets. Which cloud service the Backend API uses is determined by the following environment variable:

`PUBLISH_STORAGE_TYPE=(gcs|aws)`

##### Google Cloud Storage (GCS)
The following environment variables will need to be set on the server if the deployed application is configured to use GCS:
```
GOOGLE_APPLICATION_CREDENTIALS (Name of JSON file containg Google credentials)
GOOGLE_CLOUD_PROJECT (Google Cloud project containing storage bucket)
GCLOUD_STORAGE_BUCKET (Bucket to push published data to)
```
##### AWS S3
The following environment variables will need to be set on the server if the deployed application is configured to use AWS S3:

```
S3_BUCKET (Name of S3 bucket to publish files to)
S3_REGION (Region of bucket)
S3_ACCESS_KEY (S3 Access Key)
S3_SECRET_KEY (S3 Secret Key)
```

### Node Environment
The `NODE_ENV` environment variable indicates what environment the application is running in.

For the staging environment the variable should be set as follows: `NODE_ENV=staging`

For the production environment the variable should be set as follows: `NODE_ENV=production`

### JWT Configuration
The sample application makes use of JWT to authenticate requests to the server. Two environment variables need to be set in order to properly configure usage of JWT.

#### `JWT_SECRET`
The `JWT_SECRET` is used to sign JWTs and should be at least 64 characters, and generated using a [secure source of randomness](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#secure-random-number-generation).

Example: `JWT_SECRET="TVCH846KJdIyuB0s+vhXmoJa1YcVcDSsLjv+jTUDKJKzySdMvmIzelTjshPylKlcKpQDX2RUVc5sSuNpgVKIqA=="`

#### `JWT_EXP`
This `JWT_EXP` variable configures the time till expiration on a JWT. The value is represented as seconds. It is recommended that JWTs should be short lived.

Example: `JWT_EXP=3600`

#### `BYPASS_SAMESITE`
This value controls the `SamesSite` cookie attribute for the authorization cookie returned by `/login`. If the value is `true`, then the cookie uses `SameSite=None`. Otherwise, it uses `SameSite=Strict`. The value of the environment variable should always be set to `false` in deployed scenarios but will need to be set to `true` for local development.

### Post Deployment Tasks

#### First Deployment
Below are tasks that should run the first time the application is deployed.

#### Seeding the Database
The database should be seeded with the stock organization and users by running the following command:

`spdl seed:run --scope private --env development (staging|production)`

### All Deployments
Below are tasks that should run on every deployment.

##### Migrate Database
The following command should be run on every deployment to migrate the database (if using Docker this should be handled by the [dbsetup.sh](https://github.com/Path-Check/safeplaces-backend/blob/dev/dbsetup.sh) script):

`spdl migrate:latest --scope private --env (staging|production)`

## Security Recommendations
We recommend the following for deployed versions of any and all SafePlace APIs:

- The following headers (and appropriate values) should be returned from the server to client:
	- X-Frame-Options
	- X-XSS-Protection
	- X-Content-Type-Options
	- Expect-CT
	- Feature-Policy
	- Strict-Transport-Security
- A suitable "Referrer-Policy" header is included, such as "no-referrer" or "same-origin"
- The server running SafePlaces should not expose any information about itself that is unneeded (i.e., type of server (nginx) and version (1.17.8))
- Implement an appropriate security policy
- All SafePlaces APIs should be deployed behind an appropriately configured firewall
- All requests to and from a SafePlaces API should be over HTTPS
- Old versions of SSL and TLS protocols, algorithms, ciphers, and configuration are disabled, such as SSLv2, SSLv3, or TLS 1.0 and TLS 1.1. The latest version of TLS should be the preferred cipher suite.
- The web server should be configured under a low-privilege system user account.
-  Any debug model provided by the web or application server is disabled.
