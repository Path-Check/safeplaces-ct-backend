module.exports = {
  test: {
    client: 'pg',
    pool: {
      min: 0,
      max: 2,
      idleTimeoutMillis: 500,
    },
    connection: {
      host: process.env.DB_HOST_PUB,
      user: process.env.DB_USER_PUB,
      password: process.env.DB_PASS_PUB,
      database: process.env.DB_NAME_PUB,
    },
  },
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST_PUB,
      user: process.env.DB_USER_PUB,
      password: process.env.DB_PASS_PUB,
      database: process.env.DB_NAME_PUB,
    },
  },
  staging: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST_PUB,
      user: process.env.DB_USER_PUB,
      password: process.env.DB_PASS_PUB,
      database: process.env.DB_NAME_PUB,
    },
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST_PUB,
      user: process.env.DB_USER_PUB,
      password: process.env.DB_PASS_PUB,
      database: process.env.DB_NAME_PUB,
    },
  },
};
