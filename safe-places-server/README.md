# Example NodeJS Postgres DB based backend for Safeplaces API

## Deployment

### Deploy in local machine

*Note*: The installation assumes you have already installed Postgres DB in your local environment listening for connections at port 5432.

Clone this repository

```
cd safeplaces-backend
```

#### Install Package Manager

Steps to install NVM are documented [in the nvm repository](https://github.com/nvm-sh/nvm#installing-and-updating).  
  
Install npm using nvm

```
nvm install 13.1.0
nvm use 13.1.0
npm install
```

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
