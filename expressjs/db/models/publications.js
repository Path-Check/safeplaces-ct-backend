const knex = require('../knex.js');
const BaseService = require('../common/service.js');

class Service extends BaseService {

  findLastOne(query) {
    return knex(this._name).where(query).orderBy('created_at', 'desc').first();
  }

  insert(publication) {
    publication.start_date = new Date(publication.start_date * 1000);
    publication.end_date = new Date(publication.end_date * 1000);
    publication.publish_date = new Date(publication.publish_date * 1000);

    return knex(this._name).insert(publication).returning('*');
  }

}

module.exports = new Service('publications');