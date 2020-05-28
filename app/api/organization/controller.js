const _ = require('lodash');
const organizations = require('../../../db/models/organizations');

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
    res.status(200).json(_.pick(organization, ['organization_id','name']));
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
 * TODO: Build
 * 
 * Create cases associated with organization.
 * Organization is pulled from the user.
 *
 */
exports.createOrganizationCase = async (req, res) => {
  const {
    user: { organization_id }
  } = req;

  if (!organization_id) throw new Error('Organization ID is missing.');

  const cases = await organizations.getCases(organization_id);
  if (cases) {
    res.status(200).json({ cases });
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
    body: { case_id }
  } = req;

  if (!organization_id) throw new Error('Organization ID is missing.');
  if (!case_id) throw new Error('Case ID is missing.');

  const results = await organizations.deleteCase(organization_id, case_id);
  if (results) {
    res.sendStatus(200);
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
