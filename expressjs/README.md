
# Example NodeJS Postgres DB based backend for Safeplaces API

  

  

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

#### Setup Database

1. Create databases and users mentioned exported in your environment.
1. Grant users sufficient access to the database.

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
3. Your `pg_hba.conf` should have a rule added for `host all all 172.18.0.0/16 md5`.

 

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

Ensure to create Postgres Environment variables file  .backend.env from .backend.env.template 

```

#### Run the following:

docker-compose build
docker-compose up

Test your deployment via `curl http://127.0.0.1:3000/health`
