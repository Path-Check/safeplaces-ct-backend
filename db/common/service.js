const knex = require('../knex.js');

class BaseService {
  constructor(name, scope /* private or public */) {
    this._name = name;
    this._scope = (scope || 'private');
  }

  all() {
    return this.table.select();
  }

  find(query) {
    if (!query) throw new Error('Filter was not provided');

    return this.table.where(query);
  }

  findOne(query) {
    if (!query) throw new Error('Filter was not provided');

    return this.table.where(query).first();
  }

  async updateOne(id, params) {
    if (!id) throw new Error('ID was not provided');
    if (!params) throw new Error('Params were not provided');

    const results = await this.table.where({ id: id }).update(params).returning('*');

    if (results) {
      return results[0]
    }
  }

  updateMany(query, params) {
    if (!query) throw new Error('Query was not provided');
    if (!params) throw new Error('Params were not provided');

    return this.table.where(query).update(params).returning('*');
  }

  create(params) {
    if (!params) throw new Error('Params were not provided');

    return this.table.insert(params).returning('*');
  }

  deleteOne(query) {
    if (!query) throw new Error('Query was not provided');

    return this.table.where(query).del();
  }

  deleteAllRows() {
    return this.table.del();
  }

  get database() {
    return knex[this._scope];
  }

  get table() {
    return this.database(this._name);
  }
}

module.exports = BaseService;
