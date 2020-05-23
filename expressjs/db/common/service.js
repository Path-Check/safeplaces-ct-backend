const knex = require('../knex.js');

class BaseService {
  constructor(name) {
    this._name = name;
  }

  all() {
    return knex(this._name).select();
  }

  find(query) {
    if (!query) throw new Error('Filter was not provided');

    return knex(this._name).where(query);
  }

  findOne(query) {
    if (!query) throw new Error('Filter was not provided');

    return knex(this._name).where(query).first();
  }

  updateOne(id, params) {
    if (!id) throw new Error('ID was not provided');
    if (!params) throw new Error('Params were not provided');

    return knex(this._name).where({ id: id }).update(params).returning('*');
  }

  create(params) {
    if (!params) throw new Error('Params were not provided');

    return knex(this._name).insert(params).returning('*');
  }

  deleteAllRows() {
    return knex(this._name).del();
  }

  get table() {
    return knex(this._name);
  }
}

module.exports = BaseService;
