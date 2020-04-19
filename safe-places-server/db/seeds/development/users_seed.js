exports.seed = function(knex, Promise) {
  return knex('users').del() // Deletes ALL existing entries
    .then(function() { // Inserts seed entries one by one in series
      return knex('users').insert({
        username: 'someuser',
        password: 'something',
        salt: 'something',
      });
    }).then(function () {
      return knex('users').insert({
        username: 'otheruser',
        password: 'something',
        salt: 'something',
      });
    });
};
