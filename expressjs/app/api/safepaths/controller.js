const _ = require('lodash')
const trails = require('../../../db/models/trails');
const organizations = require('../../../db/models/organizations');
const publications = require('../../../db/models/publications');
const publicationFiles = require('../../lib/publicationFiles');

/**
 * @method fetchSafePaths
 *
 * Fetch Safe Paths files for a given organization.
 * 
 * https://arjunphp.com/express-js-zip-and-download-files/
 *
 */
exports.fetchSafePaths = async (req, res) => {
  const { params: { organization_id }, query: { type } } = req;

  const organization = await organizations.findOne({ id: organization_id });
  if (organization) {
    const record = await publications.findLastOne({ organization_id });
    if (!record) {
      return res.status(204).send('');
    }

    let timeInterval = {
      start_date: record.start_date.getTime() / 1000,
      end_date: record.end_date.getTime() / 1000,
    };

    const trailsRecords = await trails.findInterval(timeInterval);
    if (trailsRecords) {
      const intervalTrails = trails.getRedactedTrailFromRecord(trailsRecords);
      
      if (type === 'zip') {
        let data = await publicationFiles.buildAndZip(organization, record, intervalTrails)

        res.status(200)
          .set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${record.id}.zip"`,
            'Content-Length': data.length
          })
          .send(data)
      }
      
      let response = publicationFiles.build(organization, record, intervalTrails)
      res.status(200).json(response);
    } else {
      res.status(500).json({ message: 'Internal Server Error (2)' });
    }

  } else {
    res.status(500).json({ message: 'Internal Server Error (1)' });
  }
};

/**I 
 * @method createSafePath
 *
 * Publish a Safe Paths file(s) 
 *
 */
exports.createSafePath = async (req, res) => {

  const { body, user: { id: user_id, organization_id } } = req

  let safePathsResponse = {};
  let safePath = {};

  safePathsResponse.organization_id = req.user.organization_id;
  safePathsResponse.user_id = req.user.id;

  safePath.publish_date = req.body.publish_date;

  // Constuct a publication record before inserting
  const publication = _.extend(_.pick(body, ['start_date','end_date','publish_date']), { user_id, organization_id })

  // Construct a organization record before updating
  // TODO: Why are we constructing a new Organization for update?
  const organization = _.pick(body, ['authority_name','info_website','safe_path_json']);

  // Construct a timeSlice record for getting a trail within this time interval
  let timeSlice = {};
  timeSlice.start_date = req.body.start_date;
  timeSlice.end_date = req.body.end_date;

  const publicationRecords = await publications.insert(publication);
  if (publicationRecords) {
    safePathsResponse.datetime_created = new Date(publicationRecords[0].created_at).toString();

    const organizationRecords = await organizations.update(
      organization_id,
      organization,
    );
    if (organizationRecords) {
      safePath.authority_name = organizationRecords[0].authority_name;
      safePath.info_website = organizationRecords[0].info_website;
      safePath.safe_path_json = organizationRecords[0].safe_path_json;

      const intervalTrail = await trails.findInterval(timeSlice);
      if (intervalTrail) {
        let intervalPoints = [];
        intervalPoints = trails.getRedactedTrailFromRecord(intervalTrail);
        safePath.concern_points = intervalPoints;
        safePathsResponse.safe_path = safePath;

        res.status(200).json(safePathsResponse);

        // let response = publicationFiles.build(organization, record, intervalTrails)

        // res.status(200).json(response);

      } else {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
