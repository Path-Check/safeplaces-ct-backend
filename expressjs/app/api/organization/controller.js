const organizations = require('../../../db/models/organizations');

/**
 * @method fetchOrganization
 *
 * Fetch Organization
 *
 */
exports.fetchOrganizationById = async (req, res) => {
  const { organization_id } = req.params;

  if (!organization_id) throw new Error('Organization ID is missing.');

  const organization = await organizations.findOne({ id: organization_id });
  if (organization) {
    res.status(200).json(organization);
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
    params: { organization_id },
    body: organization,
  } = req;

  if (!organization_id) throw new Error('Organization ID is missing.');

  const results = await organizations.updateMany(organization_id, organization);
  if (results) {
    res.status(200).json(results[0]);
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
