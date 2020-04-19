exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table){
    table.increments();
    table.string('username').notNullable().unique();
    table.string('password').notNullable();
    table.string('salt').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('password');
};
  