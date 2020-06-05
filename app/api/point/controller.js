// app/api/point/controller.js

const _ = require('lodash')
const pointsService = require('../../../db/models/points');

/**
 * @method health
 *
 * Updates an existing point of concern
 *
 */
exports.updatePoint = async (req, res) => {
  const { body, body: { pointId } } = req;

  if (!pointId) throw new Error('Point ID is not valid.')
  if (!body.latitude) throw new Error('Latitude is not valid.')
  if (!body.longitude) throw new Error('Latitude is not valid.')
  if (!body.time) throw new Error('Latitude is not valid.')
  if (!body.duration) throw new Error('Duration is not valid.')

  const params = _.pick(body, ['longitude','latitude','time','duration']);

  const point = await pointsService.updateRedactedPoint(pointId, params);
  if (point) {
    res.status(200).json({ point });
  }
  throw new Error('Internal server error.');
};

/**
 * @method deletePoint
 *
 * Deletes the point of concern having the ID corresponding with the pointID param.
 *
 */
exports.deletePoint = async (req, res) => {
  const { pointId } = req.body;

  if (!pointId) throw new Error('Case ID is not valid.')

  let caseResults = await pointsService.deleteWhere({ id: pointId })
  if (caseResults) {
    res.sendStatus(200);
  }
  throw new Error('Internal server error.');
};
