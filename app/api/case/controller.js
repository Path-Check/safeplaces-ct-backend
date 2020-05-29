// app/api/case/controller.js

const casesService = require('../../../db/models/cases');
const organizationsService = require('../../../db/models/organizations');
const publicationsService = require('../../../db/models/publications');
const utils = require('../../lib/utils');
const publicationFiles = require('../../lib/publicationFiles');
const writePublishedFiles = require('../../lib/writePublishedFiles');

/**
 * @method fetchCasePoints
 *
 * Returns all points of concern for the provided case.
 *
 */
exports.fetchCasePoints = async (req, res) => {
  const { caseId } = req.query;

  if (!caseId) throw new Error('Case ID is not valid.')

  let concernPoints = await casesService.fetchCasePoints(caseId)
  if (concernPoints) {
    res.status(200).json({ concernPoints });
  }
  throw new Error('Internal server error.');
};

/**
 * @method createCasePoint
 *
 * Creates a new point of concern to be associated with the case.
 *
 */
exports.createCasePoint = async (req, res) => {
  const { caseId, point } = req.body;

  if (!caseId) throw new Error('Case ID is not valid.')
  if (!point.latitude) throw new Error('Latitude is not valid.')
  if (!point.longitude) throw new Error('Latitude is not valid.')
  if (!point.time) throw new Error('Latitude is not valid.')

  let concernPoint = await casesService.createCasePoint(caseId, point)
  if (concernPoint) {
    res.status(200).json({ concernPoint });
  }
  throw new Error('Internal server error.');
};

/**
 * @method consentToPublish
 *
 * Captures user consent to having their data published in the 
 * aggregated anonymized JSON file that is available to public.
 *
 */
exports.consentToPublish = async (req, res) => {
  const { caseId } = req.body;

  if (!caseId) throw new Error('Case ID is not valid.')

  const data = {
    message: 'All Ok!',
  };

  res.status(200).json(data);
};

/**
 * @method setCaseToStaging
 *
 * Updates the state of the case from unpublished to staging.
 *
 */
exports.setCaseToStaging = async (req, res) => {
  const { caseId } = req.body;

  if (!caseId) throw new Error('Case ID is not valid.')

  let caseResults = await casesService.moveToStaging(caseId)
  if (caseResults) {
    res.status(200).json({ case: caseResults });
  }
  throw new Error('Internal server error.');
};

/**
 * @method publishCases
 *
 * Moves the state of the cases from staging to published and 
 * generates JSON file containing aggregated anonymized points 
 * of concern data. JSON file is then pushed to the endpoint 
 * responsible for hosting the published data (this functionality 
 * is implemented by HA).
 * 
 * DONE - Fetch Orgnization
 * DONE - Publish case ids passed in.
 * DONE - Fetch Points for Cases that are published and have not exipired along with all points.
 * DONE  -Figure out start and end dates for trails.
 * DONE - Create Publication
 * DONE - Build Files
 *
 */
exports.publishCases = async (req, res) => {
  const { body: { caseIds }, user: { organization_id } } = req;
  let { query: { type } } = req;

  type = type || 'file'

  if (!caseIds) throw new Error('Case IDs are invalid.')
  if (!organization_id) throw new Error('Organization ID is not valid.')

  const organization = await organizationsService.fetchById(organization_id);
  if (organization) {
    const publishResults = await casesService.publishCases(caseIds, organization.id)

    const points = await casesService.fetchAllPublishedPoints()
    if (points && points.length > 0) {
      const publicationParams = {
        organization_id: organization.id,
        start_date: utils.getMin(points, 'time'),
        end_date: utils.getMax(points, 'time'),
        publish_date: Math.floor(new Date().getTime() / 1000)
      } 
      const publication = await publicationsService.insert(publicationParams);
      if (publication) {
        if (type === 'zip') {
          let data = await publicationFiles.buildAndZip(organization, publication, points)
          res.status(200)
            .set({
              'Content-Type': 'application/octet-stream',
              'Content-Disposition': `attachment; filename="${publication.id}.zip"`,
              'Content-Length': data.length
            })
            .send(data)
        } else if (type === 'json') {
          let response = publicationFiles.build(organization, publication, points)
          res.status(200).json(response);
        }
  
        let pages = publicationFiles.build(organization, publication, points)
        
        const results = await writePublishedFiles(pages, '/tmp/trails')
        if (results) {
          let cases = publishResults.map(itm => casesService._mapCase(itm))
          res.status(200).json({ cases });
        }
        throw new Error('Files could not be written.');
      }
      throw new Error('Publication could not be generated.');
    }
    throw new Error('No points returned after cases were published.');
  }
  throw new Error('Internal server error');
};

/**
 * @method deleteCase
 *
 * Delete Case Record
 *
 */
exports.deleteCase = async (req, res) => {
  const { caseId } = req.body;

  if (!caseId) throw new Error('Case ID is not valid.')

  let caseResults = await casesService.deleteOne({ id: caseId })
  if (caseResults) {
    res.sendStatus(200);
  }
  throw new Error('Internal server error.');
};