const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const knex = require('../knex.js');
const BaseService = require('../common/service.js');
const settingsService = require('./settings.js');
const casesService = require('./cases.js');

class Service extends BaseService {

  /**
   * Fetch By Organization ID
   *
   * @method fetchById
   * @param {String} id
   * @return {Object}
   */
  fetchById(id) {
    if (!id) throw new Error('Filter was not provided');

    return knex(this._name)
              .select(
                'organizations.id AS id',
                'organizations.name',
                'settings.info_website_url',
                'settings.reference_website_url',
                'settings.api_endpoint_url',
                'settings.region_coordinates',
                'settings.notification_threshold_percent',
                'settings.notification_threshold_count',
                'settings.chunking_in_seconds',
                'settings.days_to_retain_records'
              )
              .join('settings', 'organizations.id', '=', 'settings.organization_id')
              .where({ 'organizations.id': id })
              .first();
  }

  /**
   * Create an Organization
   *
   * @method createOrganization
   * @param {Object} organization
   * @param {Object} organization.name
   * @return {Array}
   */
  async createOrganization(organization) {
    if (!organization.name) throw new Error('Organization Name was not valid');

    const validSettings = [
      'info_website_url',
      'reference_website_url',
      'api_endpoint_url',
      'region_coordinates',
      'notification_threshold_percent',
      'notification_threshold_count',
      'chunking_in_seconds',
      'days_to_retain_records'
    ]

    const results = await this.create(_.pick(organization, ['id', 'name']));
    if (results) {
      const paramsSettings = _.pick(organization, validSettings)
      const settingsResults = await settingsService.create(_.extend({ id: uuidv4(), organization_id: results[0].id }, paramsSettings));
      if (settingsResults) {
        return this.fetchById(results[0].id)
      }
    }
  }

  /**
   * Update an Organization
   *
   * @method updateOrganization
   * @param {String} id
   * @param {Object} params
   * @return {Array}
   */
  async updateOrganization(id, params) {
    if (!id) throw new Error('Organization ID was not valid');
    if (!params) throw new Error('Params were not valid');

    const results = await this.updateOne(id, params)
    if (results) {
      return  this._map(this.fetchById(id))
    }
    throw new Error('Internal server errror.')
  }

  /**
   * Update an Organization
   *
   * @method createOrganization
   * @param {String} id
   * @param {Object} organization
   * @return {Array}
   */
  async getCases(id) {
    const results = await casesService.fetchAll(id)
    if (results) {
      return results
    }
    throw new Error('Internal server errror.')
  }

  /**
   * Delete Organization Case by ID
   *
   * @method deleteCase
   * @param {String} organization_id
   * @param {String} case_id
   * @return {Object}
   */
  async deleteCase(organization_id, case_id) {
    if (!organization_id) throw new Error('Organization ID is invalid')
    if (!case_id) throw new Error('Case ID is invalid')
    
    return casesService.deleteOne({ organization_id, id: case_id });
  }

  /**
   * Update an Organization
   *
   * @private
   * @method createOrganization
   * @param {String} id
   * @param {Object} organization
   * @return {Array}
   */

   _map(itm) {
      delete itm.id
      delete itm.updated_at
      delete itm.created_at
     return itm
   }
}

module.exports = new Service('organizations');