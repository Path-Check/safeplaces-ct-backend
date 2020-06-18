const bcrypt = require('bcrypt');

exports.seed = function (knex) {
  if (!process.env.SEED_MAPS_API_KEY) {
    throw new Error('Populate environment variable SEED_MAPS_API_KEY');
  }
  return knex('users')
    .then(async function () {
      let adminPassword = await bcrypt.hash('password', 5);
      await knex('users').insert({
        id: 'a88309ca-26cd-4d2b-8923-af0779e423a3',
        organization_id: 1,
        username: 'spladmin',
        password: adminPassword,
        email: 'admin@org.com',
        is_admin: true,
        maps_api_key: process.env.SEED_MAPS_API_KEY,
      });
    });
};
