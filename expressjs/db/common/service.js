var knex = require('../knex.js');

class BaseService {

  constructor(name) {
    this._name = name;
  }

  async findOne(query) {
    return knex(this._name).where(query).first();
  }

  updateOne(id, params) {
    if (!id) throw new Error('ID was not provided');

    return knex(this._name).where({ id: id }).update(params).returning('*');
  }

  create(params) {
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