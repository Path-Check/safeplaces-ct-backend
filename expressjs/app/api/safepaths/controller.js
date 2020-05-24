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

  const response = {
    organization_id,
    user_id,
    datetime_created: null,
    safePath: null
  }

  // Constuct a publication record before inserting
  const publicationParams = _.extend(_.pick(body, ['start_date','end_date','publish_date']), { user_id, organization_id })

  // Construct a organization record before updating
  // TODO: Why are we updating the Organization for publish?
  const organizationParams = _.pick(body, ['authority_name','info_website','safe_path_json']);

  // Construct a timeSlice record for getting a trail within this time interval
  let timeSlice = _.pick(body, ['start_date','end_date']);

  const record = await publications.insert(publicationParams);
  if (record) {
    response.datetime_created = new Date(record.created_at).toString();
    const organization = await organizations.updateOne(organization_id, organizationParams);
    if (organization) {
      const trailsRecords = await trails.findInterval(timeSlice);
      if (trailsRecords) {
        const intervalTrails = trails.getRedactedTrailFromRecord(trailsRecords);
        response.safe_path = publicationFiles.build(organization, record, intervalTrails)
        res.status(200).json(response);
      } else {
        res.status(500).json({ message: 'Internal Server Error (3)' });
      }
    } else {
      res.status(500).json({ message: 'Internal Server Error (2)' });
    }
  } else {
    res.status(500).json({ message: 'Internal Server Error (1)' });
  }
};
