const BaseService = require('../common/service.js');
const knex = require('../knex.js');

const pointsService = require('./points');

class Service extends BaseService {

  /**
   * Mark Case Published
   *
   * @method publish
   * @param {Array} case_ids
   * @param {String} organization_id
   * @return {Array}
   */
  async publishCases(case_ids, organization_id) {
    if (!case_ids) throw new Error('Case IDs are invalid')
    if (!case_ids.length) throw new Error('Case IDs length is zero')
    if (!organization_id) throw new Error('Organization ID is not valid')

    const results = await knex(this._name)
      .whereIn('id', case_ids)
      .where('organization_id', organization_id)
      .where('state', 'staging');
    if (results.length === case_ids.length) {
      const updateResults = await knex(this._name)
              .whereIn('id', case_ids)
              .update({ state: 'published' })
              .returning('*');
      if (updateResults) {
        return knex(this._name)
                .where('state', 'published')
                .where('expires_at', '>', new Date())
                .returning('*');
      }
    }
    throw new Error('Could not publish the case. Make sure all are moved into staging state.')
  }

  /**
   * Mark Case Staging
   *
   * @method stage
   * @param {Number} case_id
   * @return {Array}
   */
  async moveToStaging(case_id) {
    const results = await this.updateOne(case_id, { state: 'staging' });
    if (results) {
      return this._mapCase(results);
    }
  }

  /**
   * Mark Case Unpublished
   *
   * @method stage
   * @param {Number} case_id
   * @return {Array}
   */
  async unpublish(case_id) {
    const results = await this.updateOne(case_id, { state: 'unpublished' });
    if (results) {
      return this._mapCase(results);
    }
  }

  /**
   * Create Case
   *
   * @method stage
   * @param {Object} options
   * @param {Number} options.organization_id
   * @param {Timestamp} options.expires_at
   * @return {Object}
   */
  async createCase(options = null) {
    if (!options.organization_id) throw new Error('Organization ID is invalid')
    if (!options.expires_at) throw new Error('Expires at Date is invalid')

    const caseId = await this.getNextId(options.organization_id)
    if (caseId) {
      options.id = caseId;
      const cases = await this.create(options);

      if (cases) {
        return this._mapCase(cases.shift());
      }
    }

    throw new Error('Could not create the case.')
  }

  /**
   * Get All Cases in Descending order
   *
   * @method fetchAll
   * @param {Number} organization_id
   * @return {Array}
   */
  fetchAll(organization_id) {
    return knex(this._name).where({ organization_id }).orderBy('created_at', 'desc').returning('*');
  }

  /**
   * Update Case Publication Id
   *
   * @method updateCasePublicationId
   * @param {Number} id
   * @return {Array}
   */
  updateCasePublicationId(ids, publication_id) {
    if (!ids) throw new Error('IDs are invalid')
    if (!ids.length === 0) throw new Error('IDs have an invalid length')
    if (!publication_id) throw new Error('Publication ID is invalid')

    return knex(this._name).whereIn('id', ids).update({ publication_id })
  }

  /**
   * Fetch all case points
   *
   * @method fetchCasePoints
   * @param {Number} case_id
   * @return {Array}
   */
  async fetchCasePoints(case_id) {
    if (!case_id) throw new Error('Case ID is invalid')

    const points = await pointsService.fetchRedactedPoints(case_id)
    if (points) {
      return points
    }
    return []
  }

  /**
   * Fetch all case points
   *
   * @method createCasePoint
   * @param {Number} case_id
   * @param {Object} point
   * @return {Object}
   */
  async createCasePoint(case_id, point) {
    if (!case_id) throw new Error('Case ID is invalid')
    if (!point) throw new Error('Point is invalid')

    const points = await pointsService.createRedactdPoint(case_id, point)
    if (points) {
      return points
    }
    return []
  }

  /**
   * Fetch all points from cases that are published
   *
   * @method fetchAllPublishedPoints
   * @param {Number} case_id
   * @param {Object} point
   * @return {Object}
   */
  async fetchAllPublishedPoints() {
    const points = await knex(this._name)
              .select(
                'cases.id AS caseId',
                'publications.publish_date',
                'points.id AS pointId',
                'points.coordinates',
                'points.time',
                'points.hash'
              )
              .join('points', 'cases.id', '=', 'points.case_id')
              .join('publications', 'cases.publication_id', '=', 'publications.id')
              .where('cases.state', 'published')
              .where('cases.expires_at', '>', new Date())
              .returning('*');
    if (points) {
      return pointsService._getRedactedPoints(points, true, false);
    }
    return []
  }

  /**
   * Update Case External Id
   *
   * @method updateCasePublicationId
   * @param {Number} id
   * @return {Object}
   */
  async updateCaseExternalId(case_id, external_id) {
    if (!case_id) throw new Error('ID is invalid')
    if (!external_id) throw new Error('External ID is invalid')

    const results = await this.updateOne(case_id, { external_id });

    if (results) {
      return this._mapCase(results);
    }
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

  _mapCase(itm) {
    itm.caseId = itm.id
    itm.updatedAt = itm.updated_at
    itm.expiresAt = itm.expires_at
    itm.externalId = itm.external_id
    delete itm.organization_id
    delete itm.publication_id
    delete itm.updated_at
    delete itm.expires_at
    delete itm.created_at
    delete itm.id
    return itm
  }
}

module.exports = new Service('cases');
