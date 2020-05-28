const BaseService = require('../common/service.js');
const knex = require('../knex.js');

class Service extends BaseService {

  publish(id) {
    return this.updateState(id, 'published');
  }

  stage(id) {
    return this.updateState(id, 'staging');
  }

  unpublish(id) {
    return this.updateState(id, 'staging');
  }

  async createCase(options = null) {
    if (!options.organization_id) throw new Error('Organization ID is invalid')

    const caseId = await this.getNextId(options.organization_id)
    if (caseId) {
      options.id = caseId;
      return this.create(options);
    }
  }

  /**
   * Get All Cases in Descending order
   *
   * @method fetchAll
   * @param {String} id
   * @return {Array}
   */
  fetchAll(id) {
    return knex(this._name).where({ organization_id: id }).orderBy('created_at', 'desc').returning('*');
  }

  /**
   * Update Case Publication Id
   *
   * @method updateCasePublicationId
   * @param {String} id
   * @return {Array}
   */
  updateCasePublicationId(ids, publication_id) {
    if (!ids) throw new Error('IDs are invalid')
    if (!ids.length === 0) throw new Error('IDs have an invalid length')
    if (!publication_id) throw new Error('Publication ID is invalid')

    return knex(this._name).whereIn('id', ids).update({ publication_id })
  }

  // private

  /**
   * Get ID for next Case
   *
   * @private
   * @method getNextId
   * @param {String} organization_id
   * @return {Array}
   */
  async getNextId(organization_id) {
    const caseResults = await knex(this._name).where({ organization_id }).orderBy('created_at', 'desc').first();
    if (caseResults) {
      return (caseResults.id + 1);
    }
    return 1;
  }

  /**
   * Update State
   *
   * @private
   * @method updateState
   * @param {String} id
   * @param {String} state
   * @return {Array}
   */
  updateState(id, state) {
    if (['unpublished', 'staging', 'published'].indexOf(state) === -1) {
      throw new Error('Invalid state ' + state);
    }

    return this.updateOne(id, {
      state,
    });
  }
}

module.exports = new Service('cases');