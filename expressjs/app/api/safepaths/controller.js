const trails = require('../../../db/models/trails');
const organizations = require('../../../db/models/organizations');
const publications = require('../../../db/models/publications');

/**
 * @method fetchSafePaths
 * 
 * fetchSafePaths
 * 
 */
exports.fetchSafePaths = async (req, res) => {
  let safePathsResponse = {};

  const publicationRecord = await publications.findLastOne({organization_id: req.params.organization_id});
  if (publicationRecord) {
    safePathsResponse.publish_date = publicationRecord.publish_date.getTime()/1000;
  } else {
    return res.status(204).send('');
  }

  let timeInterval = {
    start_date: publicationRecord.start_date.getTime()/1000,
    end_date: publicationRecord.end_date.getTime()/1000
  };

  const redactedTrailRecords = await trails.findInterval(timeInterval);
  if (redactedTrailRecords) {
    const intervalTrails = trails.getRedactedTrailFromRecord(redactedTrailRecords);
    const organization = await organizations.findOne({id: req.params.organization_id});
    if (organization) {
      safePathsResponse.authority_name = organization.authority_name;
      safePathsResponse.concern_points = intervalTrails;
      safePathsResponse.info_website = organization.info_website;

      res.status(200).json(safePathsResponse);
    } else {
      res.status(500).json({message: 'Internal Server Error'});
    }
  } else {
    res.status(500).json({message: 'Internal Server Error'});
  }
};

/**
 * @method createSafePath
 * 
 * createSafePath
 * 
 */
exports.createSafePath = async (req, res) => {
  let safePathsResponse = {};
  let safePath = {};

  safePathsResponse.organization_id = req.user.organization_id;
  safePathsResponse.user_id = req.user.id;
  safePath.publish_date = req.body.publish_date;

  // Constuct a publication record before inserting
  let publication = {};
  publication.start_date = req.body.start_date;
  publication.end_date = req.body.end_date;
  publication.publish_date = req.body.publish_date;
  publication.user_id = req.user.id;
  publication.organization_id = req.user.organization_id;

  // Construct a organization record before updating

  let organizationId = req.user.organization_id;
  let organization = {};
  organization.authority_name = req.body.authority_name;
  organization.info_website = req.body.info_website;
  organization.safe_path_json = req.body.safe_path_json;

  // Construct a timeSlice record for getting a trail within this time interval
  let timeSlice = {};
  timeSlice.start_date = req.body.start_date;
  timeSlice.end_date = req.body.end_date;

  const publicationRecords = await publications.insert(publication);
  if (publicationRecords) {
    safePathsResponse.datetime_created = new Date(publicationRecords[0].created_at).toString();

    const organizationRecords = await organizations.update(organizationId, organization);
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
      } else {
        res.status(500).json({message: 'Internal Server Error'});
      }
    } else {
      res.status(500).json({message: 'Internal Server Error'});
    }
  } else {
    res.status(500).json({message: 'Internal Server Error'});
  }
};
