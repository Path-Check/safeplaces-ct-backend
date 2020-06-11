const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');

const BaseService = require('../common/service.js');

const settingsService = require('./settings.js');
const casesService = require('./cases.js');
const publicService = require('./publicOrganizations.js');

const settingsFields = [
  'info_website_url',
  'reference_website_url',
  'api_endpoint_url',
  'privacy_policy_url',
  'region_coordinates',
  'notification_threshold_percent',
  'notification_threshold_count',
  'chunking_in_seconds',
  'days_to_retain_records'
];

const publicFields = [
  'name',
  'external_id',
  'info_website_url',
  'reference_website_url',
  'api_endpoint_url',
  'privacy_policy_url',
  'region_coordinates',
  'notification_threshold_percent',
  'notification_threshold_count',
];

class Service extends BaseService {

  /**
   * Fetch By Organization ID
   *
   * @method fetchById
   * @param {String} id
   * @return {Object}
   */
  async fetchById(id) {
    if (!id) throw new Error('Filter was not provided');

    const org = await this.table
              .select(
                'organizations.id AS id',
                'organizations.name',
                'organizations.completed_onboarding',
                'organizations.external_id',
                'settings.info_website_url',
                'settings.reference_website_url',
                'settings.api_endpoint_url',
                'settings.region_coordinates',
                'settings.notification_threshold_percent',
                'settings.notification_threshold_count',
                'settings.chunking_in_seconds',
                'settings.days_to_retain_records',
                'settings.privacy_policy_url'
              )
              .join('settings', 'organizations.id', '=', 'settings.organization_id')
              .where({ 'organizations.id': id })
              .first();
    if (org) {
      return this._map(org);
    }
    throw new Error('Problem fetching the organization.');
  }

  /**
   * Create an Organization
   *
   * @method createOrganization
   * @param {Object} organization
   * @param {Object} organization.name
   * @return {Object}
   */
  async createOrganization(organization) {
    if (!organization.name) throw new Error('Organization Name was not valid');

    if (organization.external_id == null) {
      organization.external_id = uuidv4();
    }

    const results = await this.create(_.pick(organization, ['id', 'external_id', 'name']));

    if (results) {
      const id = results[0].id;

      // Create settings record
      await settingsService.create(_.extend(
        { id: uuidv4(), organization_id: id },
        _.pick(organization, settingsFields)
      ));

      // Create public record
      await publicService.createOrUpdate(id, _.pick(organization, publicFields));

      return this.fetchById(id);
    }
  }

  /**
   * Update an Organization
   *
   * @method updateOrganization
   * @param {String} id
   * @param {Object} params
   * @return {Object}
   */
  async updateOrganization(id, params) {
    if (!id) throw new Error('Organization ID was not valid');
    if (!params) throw new Error('Params were not valid');

    const mappedParams = this._reverseMap(params);
    let orgResults = await this.updateOne(id, _.pick(mappedParams, ['name', 'completed_onboarding']));

    if (orgResults) {
      // If external_id doesn't exist yet, assign one for public record creation
      if (orgResults.external_id == null) {
        mappedParams.external_id = uuidv4();
        orgResults = await this.updateOne(id, _.pick(mappedParams, ['external_id']));
      }

      await settingsService.updateByOrganizationId(id, _.pick(mappedParams, settingsFields));
      await publicService.createOrUpdate(id, _.pick(mappedParams, publicFields));
    }

    return await this.fetchById(id);
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
   * Clean out organizations cases that have expired.
   *
   * @method cleanOutExpiredCases
   * @param {String} organization_id
   * @return {Object}
   */
  async cleanOutExpiredCases(organization_id) {
    if (!organization_id) throw new Error('Organization ID is invalid')

    return casesService.deleteCasesPastRetention(organization_id)
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

    return casesService.deleteWhere({ organization_id, id: case_id });
  }

  /**
   * Map Organization
   *
   * @private
   * @method _map
   * @param {String} id
   * @param {Object} organization
   * @return {Array}
   */

   _map(itm) {
      return {
        id: itm.id,
        externalId: itm.external_id,
        name: itm.name,
        infoWebsiteUrl: itm.info_website_url || '',
        referenceWebsiteUrl: itm.reference_website_url || '',
        apiEndpointUrl: itm.api_endpoint_url || '',
        privacyPolicyUrl: itm.privacy_policy_url || '',
        regionCoordinates: itm.region_coordinates,
        notificationThresholdPercent: itm.notification_threshold_percent,
        notificationThresholdCount: itm.notification_threshold_count,
        chunkingInSeconds: itm.chunking_in_seconds,
        daysToRetainRecords: itm.days_to_retain_records,
        completedOnboarding: itm.completed_onboarding
      }
   }


   /**
   * Map camelcase params to snakecase
   *
   * @private
   * @method _reverseMap
   * @param {Object}
   * @return {Object}
   */

   _reverseMap(itm) {
     return {
       name: itm.name,
       info_website_url: itm.infoWebsiteUrl,
       reference_website_url: itm.referenceWebsiteUrl,
       api_endpoint_url: itm.apiEndpointUrl,
       privacy_policy_url: itm.privacyPolicyUrl,
       region_coordinates: itm.regionCoordinates,
       notification_threshold_percent: itm.notificationThresholdPercent,
       notification_threshold_count: itm.notificationThresholdCount,
       chunking_in_seconds: itm.chunkingInSeconds,
       days_to_retain_records: itm.daysToRetainRecords,
       completed_onboarding: itm.completedOnboarding
     }
   }
}

module.exports = new Service('organizations');
