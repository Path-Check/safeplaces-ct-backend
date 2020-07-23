# Safeplaces Backend API

The SafePlaces Backend Service is an internal service that is utilized by the SafePlaces Frontend to configure an organization and create, stage, and publish cases.

More information on the SafePlaces Backend API and other SafePlaces APIs can be found in the the [SafePlaces Docs repository](https://github.com/Path-Check/safeplaces-docs/tree/master/safeplaces-backend-services).

## Local Development

### Clone this repository

```
cd safeplaces-backend
```

### Install Package Manager

Steps to install NVM are documented [in the nvm repository](https://github.com/nvm-sh/nvm#installing-and-updating).

### Install npm using nvm

```
nvm install 14.4.0
nvm use 14.4.0
npm install
```

### Setup Environment

Refer [.env.template](.env.template) for environment variables to be exported to your environment.

### Setup Databases

1. Create the private database reflecting environment variables in `.env`

```
createdb safeplaces
```

2. Create the public database reflecting environment variables in `.env`

```
createdb safeplaces_public
```

3. Create the user exported in your environment.

```
psql=# CREATE USER safepaths_user PASSWORD 'password';
```

4. Grant database user superuser privilege.

```
psql=# ALTER USER safepaths_user WITH SUPERUSER;
```

### Install Safe Places Data Layer globally

```
npm i -g @pathcheck/data-layer
```

### Run migrations

For private database:

```
env $(cat .env) spdl migrate:latest --scope private --env development
```

For public database:

```
env $(cat .env) spdl migrate:latest --scope public --env development
```

### Seed the databases

For private database:

```
env $(cat .env) spdl seed:run --scope private --env development
```

For public database:

```
env $(cat .env) spdl seed:run --scope public --env development
```

### Test Suite

Run all tests with the following command

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



#### Build Dockerfile

```
docker build -t safeplaces-backend-api:latest .
```

#### Run Dockerfile

```
docker run --rm --name safeplaces-backend-api --env-file=.env -p 8080:8080 safeplaces-backend-api
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
curl http://localhost:8080/health
```

Should respond with:

```
{
  "message": "All Ok!"
}
```

## Production and Staging Deployments
This section of the readme will detail configuration of deployed environments. In our sample application, we support the deployment of a staging and production version of the application.

### Database Configuration
Databases for the staging and production version of the application will be configured similarly. Each environment will use its own database.

Both the Backend API (this repo) and the Ingest service make use of their own PostgreSQL databases. The Backend API will need the ability to read and write to both its database and the Ingest database. The following environment variables will need to be set on the server hosting the Backend API:
```
# Private Database Configuration Environment Variables (Backend API Database)
DB_HOST (IP of your PostgreSQL Server)
DB_NAME (Name of database)
DB_USER (Name of appropriatly configured user)
DB_PASS (Password for corresponding user)

# Public Database Config Environment Variables (Ingest API Database)
DB_HOST_PUB (IP of your PostgreSQL Server)
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

### BYPASS_SAMESITE
This value controls the `SamesSite` cookie attribute for the authorization cookie returned by `/login`. If the value is `true`, then the cookie uses `SameSite=None`. Otherwise, it uses `SameSite=Strict`. The value of the environment variable should always be set to `false` in deployed scenarios but will need to be set to `true` for local development.

### CORS Configuration

The Docker container deployment within the project includes instances of Nginx reverse proxy to handle requests to the expressJS application and manages CORS configurations.

CORS can be found in deployment-configs/nginx-app.conf

CORS configs can be overriden by changing the domain values in the following snippet :

```             
set $cors 'true';
if ($http_origin ~ '^https?://(localhost|.*\.extremesolution\.com|.*\.safeplaces\.cloud)') {
  set $cors 'true';
}
```


### Post Deployment Tasks

#### First Deployment
Below are tasks that should run the first time the application is deployed.

#### Seeding the Database
The database should be seeded with the stock organization and users by running the following command:

`env $(cat .env) spdl seed:run --scope private --env development (staging|production)`

### All Deployments
Below are tasks that should run on every deployment.

##### Migrate Database
The following command should be run on every deployment to migrate the database (if you are using Docker this should be handled by the ENTRYPOINT step in the Dockefile by running [dbsetup.sh](https://github.com/Path-Check/safeplaces-backend/blob/dev/dbsetup.sh) script):

`env $(cat .env) spdl migrate:latest --scope private --env (staging|production)`
