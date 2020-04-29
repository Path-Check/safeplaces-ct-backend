const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');

exports.seed = function(knex, Promise) {
  if (!process.env.SEED_MAPS_API_KEY){
    throw new Error('Populate environment variable SEED_MAPS_API_KEY');
  }
  return knex('users').del() // Deletes ALL existing entries
    .then(async function() { // Inserts seed entries one by one in series
      let password = await bcrypt.hash('admin', 5);
      return knex('users').insert({
        id: uuidv4(),
        username: 'admin',
        password: password,
        email: 'admin@org.com',
        maps_api_key: process.env.SEED_MAPS_API_KEY
      });
    });
};
