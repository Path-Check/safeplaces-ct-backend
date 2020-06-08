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
    res.status(200).json(_.pick(organization, ['id','name', 'completedOnboarding']));
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
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
      'name',
      'completedOnboarding',
      'notificationThresholdPercent',
      'notificationThresholdCount',
      'daysToRetainRecords',
      'regionCoordinates',
      'apiEndpointUrl',
      'referenceWebsiteUrl',
      'infoWebsiteUrl',
      'privacyPolicyUrl',
    ]));
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
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
    res.status(500).json({ message: 'Internal Server Error' });
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
    res.status(500).json({ message: 'Internal Server Error' });
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
    expires_at: moment().startOf('day').add(organization.daysToRetainRecords, 'days').calendar(),
    state: 'unpublished'
  });

  if (newCase) {
    res.status(200).json(newCase);
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @method deleteOrganizationCase
 *
 * Delete case from Organization
 * Organization is pulled from the user.
 *
 */
exports.deleteOrganizationCase = async (req, res) => {
  const {
    user: { organization_id },
    body: { caseId }
  } = req;

  if (!organization_id) throw new Error('Organization ID is missing.');
  if (!caseId) throw new Error('Case ID is missing.');

  const results = await organizations.deleteCase(organization_id, caseId);
  if (results) {
    res.sendStatus(200);
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
