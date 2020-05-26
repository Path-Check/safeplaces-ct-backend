const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const knex = require('../knex.js');
const BaseService = require('../common/service.js');
const settingsService = require('./settings.js');

class Service extends BaseService {
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

  async createOrganization(organization) {
    if (!organization.name) throw new Error('Filter was not provided');

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

  async update(id, organization) {
    const orgUpdate = await this.updateOne(id, _.pick(organization, ['name']));
    if (orgUpdate) {
      const settingsUpdate = await this.updateOne(id, _.pick(organization, ['info_website_url','info_website_url']));
      if (settingsUpdate) {
        return this.fetchById(id)
      }
    }
    throw new Error('Internal server errror.')
  }
}

module.exports = new Service('organizations');
