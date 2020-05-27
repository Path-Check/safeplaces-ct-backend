const _ = require('lodash')
const trails = require('../../../db/models/trails');
const organizations = require('../../../db/models/organizations');

function formatRedactedTrailData(redactedTrailRecords) {
  let redactedTrailData = {};
  if (Array.isArray(redactedTrailRecords)) {
    let redactedTrail = trails.getRedactedTrailFromRecord(redactedTrailRecords);
    redactedTrailData = {
      identifier: redactedTrailRecords[0].redacted_trail_id,
      organization_id: redactedTrailRecords[0].organization_id,
      trail: redactedTrail,
      user_id: redactedTrailRecords[0].user_id,
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

  const redactedTrails = await trails.all();
  if (redactedTrails) {

    let redactedTrailsMap = redactedTrails.reduce((r, a) => {
      r[a.redacted_trail_id] = r[a.redacted_trail_id] || [];
      r[a.redacted_trail_id].push(a);
      return r;
    }, Object.create(null));

    const redactedTrailsList = Object.keys(redactedTrailsMap).map(key => formatRedactedTrailData(redactedTrailsMap[key]));

    // Populate organization information in response
    const organization = await organizations.fetchById(organization_id);
    if (organization) {
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
  let redactedTrailReturnData = {};

  const { trail } = req.body;

  // if (Array.isArray(trail) && trail.length) {
  //   trails
  //     .insertRedactedTrailSet(
  //       req.body.trail,
  //       req.body.identifier,
  //       req.user.organization_id,
  //       req.user.id,
  //     )
  //     .then(redactedTrailRecords => {
  //       if (Array.isArray(redactedTrailRecords)) {
  //         redactedTrailReturnData = {
  //           data: formatRedactedTrailData(redactedTrailRecords),
  //           success: true,
  //         };
  //       } else {
  //         res.status(500).json({ message: 'Internal Server Error' });
  //       }
  //       res.status(200).json(redactedTrailReturnData);
  //     })
  //     .catch(err => {
  //       //TODO: introduce logger
  //       console.log(err);
  //       res.status(500).json({ message: 'Internal Server Error' });
  //     });
  // } else {
  //   res.status(400).json({ message: 'Trail can not be empty.' });
  // }
};
