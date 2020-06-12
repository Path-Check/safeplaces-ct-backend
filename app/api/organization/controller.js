const _ = require('lodash');
const moment = require('moment');
const organizations = require('../../../db/models/organizations');
const cases = require('../../../db/models/cases');

/**
 * @method fetchOrganization
 *
 * Fetch Organization
 *
 */
exports.fetchOrganizationById = async (req, res) => {
  const { user: { organization_id } } = req;

  if (!organization_id) throw new Error('Organization ID is missing.');

  const organization = await organizations.fetchById(organization_id);
  if (organization) {
    res.status(200).json(_.pick(organization, ['id', 'externalId', 'name', 'completedOnboarding']));
  } else {
    throw new Error(`Could not fetch organization by id ${organization_id}.`);
  }
};

/**
 * @method fetchOrganizationConfig
 *
 * Fetch Organization config information.
 *
 */
exports.fetchOrganizationConfig = async (req, res) => {
  const { user: { organization_id } } = req;

  if (!organization_id) throw new Error('Organization ID is missing.');

  const organization = await organizations.fetchById(organization_id);
  if (organization) {
    res.status(200).json(_.pick(organization, [
      'id',
      'externalId',
      'name',
      'completedOnboarding',
      'notificationThresholdPercent',
      'notificationThresholdTimeline',
      'daysToRetainRecords',
      'regionCoordinates',
      'apiEndpointUrl',
      'referenceWebsiteUrl',
      'infoWebsiteUrl',
      'privacyPolicyUrl',
    ]));
  } else {
    throw new Error(`Could not fetch organization config by users org id ${organization_id}.`);
  }
};

/**
 * @method updateOrganization
 *
 * Update Organization
 *
 */
exports.updateOrganization = async (req, res) => {
  const {
    user: { organization_id },
    body: organization,
  } = req;

  if (!organization_id) throw new Error('Organization ID is missing.');

  const results = await organizations.updateOrganization(organization_id, organization);
  if (results) {
    res.status(200).json(results);
  } else {
    throw new Error(`Could not update organization by users org id ${organization_id} and paramaters.`);
  }
};

/**
 * @method fetchOrganizationCases
 *
 * Fetch cases associated with organization.
 * Organization is pulled from the user.
 *
 */
exports.fetchOrganizationCases = async (req, res) => {
  const {
    user: { organization_id }
  } = req;

  if (!organization_id) throw new Error('Organization ID is missing.');

  await organizations.cleanOutExpiredCases(organization_id)

  let cases = await organizations.getCases(organization_id);
  if (cases) {
    cases = cases.map(c => {
      // delete c.organization_id
      delete c.publication_id
      delete c.created_at
      return c
    })
    res.status(200).json({ cases });
  } else {
    throw new Error(`Could not fetch organization cases by users org id ${organization_id}.`);
  }
};

/**
 * @method createOrganizationCase
 *
 * Create cases associated with organization.
 * Organization is pulled from the user.
 *
 */
exports.createOrganizationCase = async (req, res) => {
  const {
    user: { id, organization_id }
  } = req;

  if (!id) throw new Error('User ID is missing.');
  if (!organization_id) throw new Error('Organization ID is missing.');

  const organization = await organizations.fetchById(organization_id);
  if (!organization) throw new Error('Organization could not be found.')

  const newCase = await cases.createCase({
    contact_tracer_id: id,
    organization_id,
    expires_at: moment().startOf('day').add(organization.daysToRetainRecords, 'days').format(),
    state: 'unpublished'
  });

  if (newCase) {
    res.status(200).json(newCase);
  } else {
    throw new Error(`Could not create case by users org id ${organization_id}.`);
  }
};
