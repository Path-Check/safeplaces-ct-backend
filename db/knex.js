const environment = process.env.NODE_ENV || 'development';

module.exports = {
  public: require('knex')(require('../knexfile-public.js')[environment]),
  private: require('knex')(require('../knexfile.js')[environment]),
};
