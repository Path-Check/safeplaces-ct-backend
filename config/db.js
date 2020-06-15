module.exports = {
  private: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    }
  },
  public: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST_PUB,
      user: process.env.DB_USER_PUB,
      password: process.env.DB_PASS_PUB,
      database: process.env.DB_NAME_PUB,
    }
  }
};
