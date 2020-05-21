const bcrypt = require('bcrypt');

exports.seed = function(knex) {
  if (!process.env.SEED_MAPS_API_KEY){
    throw new Error('Populate environment variable SEED_MAPS_API_KEY');
  }
  return knex('users').del() // Deletes ALL existing entries
    .then(async function() { // Inserts seed entries one by one in series
      let password = await bcrypt.hash('admin', 5);
      return knex('users').insert({
        id: 'a88309ca-26cd-4d2b-8923-af0779e423a3',
        organization_id: 'a88309c2-26cd-4d2b-8923-af0779e423a3',
        username: 'admin',
        password: password,
        email: 'admin@org.com',
        maps_api_key: process.env.SEED_MAPS_API_KEY
      });
    });
};
