const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');

exports.seed = function(knex, Promise) {
  return knex('users').del() // Deletes ALL existing entries
    .then(async function() { // Inserts seed entries one by one in series
      let password = await bcrypt.hash('admin', 5);
      return knex('users').insert({
        id: uuidv4(),
        username: 'admin',
        password: password,
        email: 'admin@org.com',
        maps_api_key: 'api_key_value',
      });
    });
};
