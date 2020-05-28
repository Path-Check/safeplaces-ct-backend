// app/api/case/controller.js

/**
 * @method deleteCase
 *
 * Delete Case Record
 *
 */
exports.deleteCase = async (req, res) => {
  const { caseId } = req.body;

  if (!caseId) throw new Error('Case ID is not valid.')

  const data = {
    message: 'All Ok!',
  };

  res.status(200).json(data);
};

/**
 * @method fetchCasePoints
 *
 * Returns all points of concern for the provided case.
 *
 */
exports.fetchCasePoints = async (req, res) => {
  const { caseId } = req.query;

  if (!caseId) throw new Error('Case ID is not valid.')

  const data = {
    message: 'All Ok!',
  };

  res.status(200).json(data);
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

  const data = {
    message: 'All Ok!',
  };

  res.status(200).json(data);
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

  const data = {
    message: 'All Ok!',
  };

  res.status(200).json(data);
};

/**
 * @method publishCase
 *
 * Moves the state of the cases from staging to published and 
 * generates JSON file containing aggregated anonymized points 
 * of concern data. JSON file is then pushed to the endpoint 
 * responsible for hosting the published data (this functionality 
 * is implemented by HA).
 *
 */
exports.publishCase = async (req, res) => {
  const { caseId } = req.body;

  if (!caseId) throw new Error('Case ID is not valid.')

  const data = {
    message: 'All Ok!',
  };

  res.status(200).json(data);
};