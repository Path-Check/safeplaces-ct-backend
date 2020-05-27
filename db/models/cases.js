const BaseService = require('../common/service.js');
const knex = require('../knex.js');

class Service extends BaseService {
  updateState(id, state) {
    if (['unpublished', 'staging', 'published'].indexOf(state) === -1) {
      throw new Error('Invalid state ' + state);
    }

    return this.updateOne(id, {
      state,
    });
  }
  updateCasePublicationId(ids, publication_id) {
    if (!ids) throw new Error('IDs are invalid')
    if (!ids.length === 0) throw new Error('IDs have an invalid length')
    if (!publication_id) throw new Error('Publication ID is invalid')

    return knex(this._name).whereIn('id', ids).update({ publication_id })
  }
}

module.exports = new Service('cases');