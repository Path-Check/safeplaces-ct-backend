const _ = require('lodash')
const trailService = require('../../../db/models/trails');
const organizationService = require('../../../db/models/organizations');

const groupBy = (arr, key) => {
  return arr.reduce((rv, x) => {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

function formatRedactedTrailData(redactedTrailRecords, organization) {
  let redactedTrailData = {};
  if (Array.isArray(redactedTrailRecords)) {
    let redactedTrail = trailService.getRedactedTrailFromRecord(redactedTrailRecords);
    redactedTrailData = {
      case_id: redactedTrailRecords[0].case_id,
      organization_id: organization.id,
      trail: redactedTrail
    };
  }
  return redactedTrailData;
}

/**
 * @method fetchRedactedTrails
 *
 * fetchRedactedTrails
 *
 */
exports.fetchRedactedTrails = async (req, res) => {
  const { user: { organization_id } } = req;

  // Populate organization information in response
  const organization = await organizationService.fetchById(organization_id);
  if (organization) {
    const redactedTrails = await trailService.all();
    if (redactedTrails) {
      let redactedTrailsMap = groupBy(redactedTrails, 'case_id')
      const redactedTrailsList = Object.keys(redactedTrailsMap).map(key => formatRedactedTrailData(redactedTrailsMap[key], organization));
      const response = {
        organization: _.extend({ organization_id }, _.pick(organization, ['name','info_website_url'])),
        data: redactedTrailsList,
      };
      res.status(200).json(response);
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @method createRedactedTrail
 *
 * createRedactedTrail
 *
 */
exports.createRedactedTrail = async (req, res) => {
  const { user, body: { trails, case_id } } = req;

  if (Array.isArray(trails) && trails.length) {
    const organization = await organizationService.fetchById(user.organization_id);
    if (organization) {
      let redactedTrailRecords = await trailService.insertRedactedTrailSet(trails, case_id);
      if (redactedTrailRecords) {
        if (Array.isArray(redactedTrailRecords)) {
          const response = {
            data: formatRedactedTrailData(redactedTrailRecords, organization),
            success: true,
          };
          res.status(200).json(response);
        } else {
          res.status(500).json({ message: 'Internal Server Error' });
        }
      } else {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(400).json({ message: 'Trail can not be empty.' });
  }
};
