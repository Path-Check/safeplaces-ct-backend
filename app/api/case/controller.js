// app/api/case/controller.js

const {
  accessCodeService,
  caseService,
  organizationService,
  pointService,
  publicationService,
  uploadService,
} = require('../../../app/lib/db');
const _ = require('lodash');
const publicationFiles = require('../../lib/publicationFiles');
const writePublishedFiles = require('../../lib/writePublishedFiles');
const writeToGCSBucket = require('../../lib/writeToGCSBucket');
const writeToS3Bucket = require('../../lib/writeToS3Bucket');

/**
 * @method fetchCasePoints
 *
 * Returns all points of concern for the provided case.
 *
 */
exports.fetchCasePoints = async (req, res) => {
  const { caseId } = req.body;

  if (!caseId) throw new Error('Case ID is not valid.');

  const concernPoints = await caseService.fetchCasePoints(caseId);

  if (concernPoints) {
    res.status(200).json({ concernPoints });
  } else {
    throw new Error(`Concern points could not be found for case id ${caseId}`);
  }
};

/**
 * @method fetchCasesPoints
 *
 * Returns all points of concern for the provided cases.
 *
 */
exports.fetchCasesPoints = async (req, res) => {
  const { caseIds } = req.body;

  if (!caseIds) {
    res.status(400).send();
    return;
  }

  const concernPoints = await caseService.fetchCasesPoints(caseIds);

  if (concernPoints) {
    res.status(200).json({ concernPoints });
  } else {
    throw new Error(
      `Concern points could not be found for case id ${JSON.stringify(
        caseIds,
      )}`,
    );
  }
};

/**
 * @method ingestUploadedPoints
 *
 * Attempts to associate previously uploaded points with a case.
 * Returns the points of concern that were uploaded for the case with the given access code.
 *
 */
exports.ingestUploadedPoints = async (req, res) => {
  const { caseId, accessCode: codeValue } = req.body;

  if (caseId == null || codeValue == null) {
    res.status(400).send();
    return;
  }

  const accessCode = await accessCodeService.find({ value: codeValue });

  // Check access code validity
  if (!accessCode) {
    res.status(403).send();
    return;
  }

  // Check whether user has declined upload acccess
  if (!accessCode.upload_consent) {
    res.status(451).send();
    return;
  }

  const uploadedPoints = await uploadService.fetchPoints(accessCode);

  // If the access code is valid but there aren't any points yet,
  // then the upload is still in progress
  if (!uploadedPoints || uploadedPoints.length == 0) {
    res.status(202).send();
    return;
  }

  const concernPoints = await pointService.createPointsFromUpload(
    caseId,
    uploadedPoints,
  );

  await uploadService.deletePoints(accessCode);

  res.status(200).json({ concernPoints });
};

/**
 * @method deleteCasePoints
 *
 * Deletes the given points of concern.
 *
 */
exports.deleteCasePoints = async (req, res) => {
  const { pointIds } = req.body;

  if (pointIds == null || !_.isArray(pointIds)) {
    res.status(400).send();
    return;
  }

  if (pointIds.length > 0) {
    await pointService.deleteIds(pointIds);
  }

  res.status(200).send();
};

/**
 * @method createCasePoint
 *
 * Creates a new point of concern to be associated with the case.
 *
 */
exports.createCasePoint = async (req, res) => {
  const { caseId, point } = req.body;

  if (!caseId) throw new Error('Case ID is not valid.');
  if (!point.latitude) throw new Error('Latitude is not valid.');
  if (!point.longitude) throw new Error('Latitude is not valid.');
  if (!point.time) throw new Error('Latitude is not valid.');
  if (!point.duration) throw new Error('Duration is not valid.');

  const concernPoint = await caseService.createCasePoint(caseId, point);

  if (concernPoint) {
    res.status(200).json({ concernPoint });
  } else {
    throw new Error(
      `Concern point could not be created for case ${caseId} using point data.`,
    );
  }
};

/**
 * @method updateCasePoint
 *
 * Updates an existing point of concern
 *
 */
exports.updateCasePoint = async (req, res) => {
  const {
    body,
    body: { pointId },
  } = req;

  if (!pointId) throw new Error('Point ID is not valid.');
  if (!body.latitude) throw new Error('Latitude is not valid.');
  if (!body.longitude) throw new Error('Latitude is not valid.');
  if (!body.time) throw new Error('Latitude is not valid.');
  if (!body.duration) throw new Error('Duration is not valid.');

  const params = _.pick(body, [
    'longitude',
    'latitude',
    'time',
    'duration',
    'nickname',
  ]);

  const concernPoint = await pointService.updateRedactedPoint(pointId, params);

  if (concernPoint) {
    res.status(200).json({ concernPoint });
  } else {
    throw new Error(
      `Concern point could not be updated for point ${pointId} using point data.`,
    );
  }
};

/**
 * @method updateCasePoints
 *
 * Updates existing points of concern
 *
 */
exports.updateCasePoints = async (req, res) => {
  const {
    body,
    body: { pointIds },
  } = req;

  if (!pointIds) throw new Error('Point IDs are not valid.');

  const params = _.pick(body, ['nickname']);

  const concernPoints = await pointService.updateRedactedPoints(
    pointIds,
    params,
  );

  if (concernPoints) {
    res.status(200).json({ concernPoints });
  } else {
    throw new Error(
      `Concern points could not be updated for points ${pointIds}.`,
    );
  }
};

/**
 * @method deleteCasePoint
 *
 * Deletes the point of concern having the ID corresponding with the pointID param.
 *
 */
exports.deleteCasePoint = async (req, res) => {
  const { pointId } = req.body;

  if (!pointId) throw new Error('Point ID is not valid.');

  const caseResults = await pointService.deleteWhere({ id: pointId });

  if (caseResults) {
    res.sendStatus(200);
  } else {
    throw new Error(`Concern point could not be deleted for point ${pointId}.`);
  }
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

  if (!caseId) throw new Error('Case ID is not valid.');

  const caseResult = await caseService.consentToPublishing(caseId);

  if (caseResult) {
    res.status(200).json({ case: caseResult });
  } else {
    throw new Error(
      `Could not set consent to publishing for case id ${caseId}.`,
    );
  }
};

/**
 * @method setCaseToStaging
 *
 * Updates the state of the case from unpublished to staging.
 *
 */
exports.setCaseToStaging = async (req, res) => {
  const { caseId } = req.body;

  if (!caseId) throw new Error('Case ID is not valid.');

  const caseResults = await caseService.moveToStaging(caseId);

  if (caseResults) {
    res.status(200).json({ case: caseResults });
  } else {
    throw new Error(`Could not set case to staging for case id ${caseId}.`);
  }
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
 * DONE - Create Publication
 * DONE - Updated new cases with Publication ID
 * DONE - Fetch Points for Cases that are published and have not exipired along with all points.
 * DONE - Build Files
 *
 * Many options when talking about response, and it's all triggered by passing in the type query param.
 * By default, we will write to a GCS bucket.  Other options include, that do not work in production:
 *
 * zip = Return a zip file
 * json = Return a JSON payload of what goes into the files that are generated
 * local = Save to local server environment
 *
 */

exports.publishCases = async (req, res) => {
  const {
    body: { caseIds },
    user: { organization_id },
  } = req;
  let {
    query: { type },
  } = req;

  type = type || process.env.PUBLISH_STORAGE_TYPE;

  if (!caseIds) throw new Error('Case IDs are invalid.');
  if (!organization_id) throw new Error('Organization ID is not valid.');

  const organization = await organizationService.fetchById(organization_id);
  if (organization) {
    const cases = await caseService.publishCases(caseIds, organization.id);

    const publicationParams = {
      organization_id: organization.id,
      publish_date: Math.floor(new Date().getTime() / 1000),
    };
    const publication = await publicationService.insert(publicationParams);
    if (publication) {
      const casesUpdateResults = await caseService.updateCasePublicationId(
        caseIds,
        publication.id,
      );
      if (!casesUpdateResults) {
        throw new Error(
          `Could not set case to staging for case id ${JSON.stringify(
            caseIds,
          )} and publication ${publication.id}.`,
        );
      }

      // Everything has been published and assigned...pull all published points.
      const points = await caseService.fetchAllPublishedPoints();

      if (points && points.length > 0) {
        if (type === 'zip' && process.env.NODE_ENV !== 'production') {
          let data = await publicationFiles.buildAndZip(
            organization,
            publication,
            points,
          );
          res
            .status(200)
            .set({
              'Content-Type': 'application/octet-stream',
              'Content-Disposition': `attachment; filename="${publication.id}.zip"`,
              'Content-Length': data.length,
            })
            .send(data);
          return;
        } else {
          let pages = await publicationFiles.build(
            organization,
            publication,
            points,
          );

          if (type === 'gcs') {
            const results = await writeToGCSBucket(pages);
            if (results) {
              res.status(200).json({ cases });
              return;
            } else {
              throw new Error(`Could not write to GCS Bucket.`);
            }
          } else if (type === 'aws') {
            const results = await writeToS3Bucket(pages);
            if (results) {
              res.status(200).json({ cases });
              return;
            } else {
              throw new Error(`Could not write to S3 Bucket.`);
            }
          } else if (process.env.NODE_ENV !== 'production') {
            if (type === 'json') {
              res.status(200).json(pages);
              return;
            } else if (type === 'local') {
              const results = await writePublishedFiles(pages, '/tmp/trails');
              if (results) {
                res.status(200).json({ cases });
                return;
              }
              throw new Error(
                'Files could not be written to /tmp/trails folder.',
              );
            }
          }
        }
        throw new Error('Files could not be written.');
      }
      throw new Error('No points returned after cases were published.');
    } else {
      throw new Error(
        'Publication could not be generated using organization and publish date.',
      );
    }
  } else {
    throw new Error(`Organization could not be found by id ${organization_id}`);
  }
};

/**
 * @method deleteCase
 *
 * Delete Case Record
 *
 */
exports.deleteCase = async (req, res) => {
  const { caseId } = req.body;

  if (!caseId) throw new Error('Case ID is not valid.');

  const caseResults = await caseService.deleteWhere({ id: caseId });

  if (caseResults) {
    res.sendStatus(200);
  } else {
    throw new Error(`Could not delete case id ${caseId}.`);
  }
};

/**
 * @method updateOrganizationCase
 *
 * Updates an existing case.
 *
 *
 */
exports.updateOrganizationCase = async (req, res) => {
  const { caseId, externalId } = req.body;

  if (!caseId) throw new Error('Case ID is missing.');

  const results = await caseService.updateCaseExternalId(caseId, externalId);
  if (results) {
    res.status(200).json({ case: results });
  } else {
    throw new Error(
      `Could not update case id ${caseId} with external id ${externalId}.`,
    );
  }
};
