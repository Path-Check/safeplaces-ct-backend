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
  let redactedTrailsResponse = {};

  const { user } = req;

  const redactedTrails = await trails.getAll();
  if (redactedTrails) {
    let redactedTrailsList = [];

    // Map all redactedTrails by redacted trail 'identifier'
    // i.e., Groups all trail points belonging to one 'identifier'
    // into a trail array.
    let redactedTrailsMap = redactedTrails.reduce(function (r, a) {
      r[a.redacted_trail_id] = r[a.redacted_trail_id] || [];
      r[a.redacted_trail_id].push(a);
      return r;
    }, Object.create(null));

    // Make the Map with 'identifier' as key into the final
    // list format with:
    // [
    //   {
    //     identifier: '',
    //     organization_id: '',
    //     trail: [],
    //     user_id: ''
    //   }, ...
    // ]
    Object.keys(redactedTrailsMap).forEach(key => {
      let element = redactedTrailsMap[key];
      redactedTrailsList.push(formatRedactedTrailData(element));
    });

    // Populate organization information in response
    const organization = await organizations.findOne({
      id: user.organization_id,
    });
    if (organization) {
      redactedTrailsResponse = {
        organization: {
          organization_id: organization.id,
          authority_name: organization.authority_name,
          info_website: organization.info_website,
          safe_path_json: organization.safe_path_json,
        },
        data: redactedTrailsList,
      };
      res.status(200).json(redactedTrailsResponse);
    } else {
      //TODO: introduce logger
      console.log(organization);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    //TODO: introduce logger
    console.log(redactedTrails);
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

  if (Array.isArray(trail) && trail.length) {
    trails
      .insertRedactedTrailSet(
        req.body.trail,
        req.body.identifier,
        req.user.organization_id,
        req.user.id,
      )
      .then(redactedTrailRecords => {
        if (Array.isArray(redactedTrailRecords)) {
          redactedTrailReturnData = {
            data: formatRedactedTrailData(redactedTrailRecords),
            success: true,
          };
        } else {
          res.status(500).json({ message: 'Internal Server Error' });
        }
        res.status(200).json(redactedTrailReturnData);
      })
      .catch(err => {
        //TODO: introduce logger
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
      });
  } else {
    res.status(400).json({ message: 'Trail can not be empty.' });
  }
};
