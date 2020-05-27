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

  const organization = await organizations.fetchById(organization_id);
  if (organization) {

    // Find the most recent publication.
    const publication = await publications.findLastPublicationAndCases({ organization_id, status: 'published' });
    if (!publication) {
      return res.status(204).send('');
    }

    const trailsRecords = await trails.findInterval(publication);
    if (trailsRecords) {
      const intervalTrails = trails.getRedactedTrailFromRecord(trailsRecords);
      
      if (type === 'zip') {
        let data = await publicationFiles.buildAndZip(organization, publication, intervalTrails)

        res.status(200)
          .set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${publication.id}.zip"`,
            'Content-Length': data.length
          })
          .send(data)
      } else if (type === 'json') {
        let response = publicationFiles.build(organization, publication, intervalTrails)
        res.status(200).json(response);
      }
      
      // TODO: Save to disk.
      let response = publicationFiles.build(organization, publication, intervalTrails)
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

  const { body, user: { organization_id } } = req

  const response = {
    organization_id,
    datetime_created: null,
    safe_path: null
  }

  // Constuct a publication record before inserting
  const publicationParams = _.extend(_.pick(body, ['start_date','end_date','publish_date']), { organization_id })

  const organization = await organizations.fetchById(organization_id);
  if (organization) {
    const publication = await publications.insert(publicationParams);
    if (publication) {
      response.datetime_created = publication.created_at;
      const trailsRecords = await trails.findInterval(publication);
      if (trailsRecords) {
        const intervalTrails = trails.getRedactedTrailFromRecord(trailsRecords);
        response.safe_path = publicationFiles.build(organization, publication, intervalTrails)
        res.status(200).json(response);
      } else {
        res.status(500).json({ message: 'Internal Server Error (3)' });
      }
    } else {
      res.status(500).json({ message: 'Internal Server Error (1)' });
    }
    
  } else {
    res.status(500).json({ message: 'Internal Server Error (2)' });
  }

  
};
