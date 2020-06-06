const BaseService = require('../common/service.js');
const Buffer = require('buffer').Buffer;

const knex = require('../knex.js').private;
const knexPostgis = require("knex-postgis");
const wkx = require('wkx');
const geoHash = require('../../app/lib/geoHash');
const transform = require('../../app/lib/pocTransform.js');

const st = knexPostgis(knex);

class Service extends BaseService {

  /**
   * Fetch All Points and run through Redaction.
   *
   * @method fetchRedactedPoints
   * @param {Array} case_ids
   * @return {Array}
   */
  async fetchRedactedPoints(case_ids) {
    if (!case_ids) throw new Error('Case IDs is invalid')

    const points = await this.table.whereIn('case_id', case_ids)
    if (points) {
      return this._getRedactedPoints(points)
    }
    throw new Error('Could not find redacted points.')
  }

  async createRedactedPoint(caseId, point) {
    let record = {
      hash: null,
      coordinates: this.makeCoordinate(point.longitude, point.latitude),
      time: new Date(point.time), // Assumes time in epoch seconds
      case_id: caseId,
    };
    const points = await this.create(record);
    if (points) {
      return this._getRedactedPoints(points).shift()
    }
    throw new Error('Could not create hash.')
  }

  async createPointsFromUpload(caseId, uploadedPoints) {
    if (!caseId) throw new Error('Case ID is invalid');
    if (!uploadedPoints) throw new Error('Uploaded points are invalid');

    const pointsGrouped = this._buildDurationPoints(uploadedPoints);

    const records = pointsGrouped.map(point => {
      return {
        hash: point.hash,
        coordinates: point.coordinates,
        time: new Date(point.time),
        upload_id: uploadedPoints[0].upload_id,
        duration: point.duration,
        case_id: caseId,
      }
    });

    const points = await this.create(records);
    if (!points) {
      throw new Error('Could not create points.');
    }

    return this._getRedactedPoints(points);
  }

  /**
   * Format a given poiint to a stored redacted point.
   *
   * @method updateRedactedPoint
   * @param {String} point_id
   * @param {Float} point.longitude
   * @param {Float} point.latitude
   * @param {Timestamp} point.time
   * @return {Object}
   */
  async updateRedactedPoint(point_id, point) {
    let record = {
      hash: null,
      coordinates: this.makeCoordinate(point.longitude, point.latitude),
      time: new Date(point.time),
      duration: point.duration
    };
    const points = await this.updateOne(point_id, record);
    if (points) {
      return this._getRedactedPoints([points]).shift()
    }
    throw new Error('Could not create hash.')
  }

  makeCoordinate(longitude, latitude) {
    return st.setSRID(
      st.makePoint(longitude, latitude),
      4326
    );
  }

  // private

  /**
   * Filter all Points and return redacted information
   *
   * @method _buildDurationPoints
   * @param {Array} points
   * @return {Array}
   */
  _buildDurationPoints(points) {
    const redactedPoints = points.map(p => {
      let point = {};
      const b = new Buffer.from(p.coordinates, 'hex');
      const c = wkx.Geometry.parse(b);
      point.coordinates = p.coordinates
      point.longitude = c.x;
      point.longitude = c.x;
      point.latitude = c.y;
      point.time = new Date(p.time).getTime();
      point.hash = p.hash;
      return point
    });

    return transform.discreetToDuration(redactedPoints)
  }

  /**
   * Filter all Points and return redacted information
   *
   * @method _getRedactedPoints
   * @param {String} case_id
   * @param {Options} Options
   * @return {Array}
   */
  _getRedactedPoints(points, includeHash = false, returnDateTime = true) {
    let redactedTrail = [];

    points.forEach(point => {
      let trail = {};
      const b = new Buffer.from(point.coordinates, 'hex');
      const c = wkx.Geometry.parse(b);
      trail.publish_date = point.publish_date || null
      trail.caseId = point.caseId || point.case_id || null
      trail.pointId = point.pointId || point.id
      trail.longitude = c.x;
      trail.latitude = c.y;
      trail.duration = point.duration;
      if (includeHash) trail.hash = point.hash;
      trail.time = (point.time.getTime() / 1000);
      if (returnDateTime) trail.time = point.time
      redactedTrail.push(trail);
    });

    return redactedTrail;
  }

  /**
   * Find cases in a specific time interval
   *
   * @method findIntervalCases
   * @param {Object} publication
   * @return {Array}
   */
  async findIntervalCases(publication) {
    if (!publication.start_date) throw new Error('Start date is invalid');
    if (!publication.end_date) throw new Error('End date is invalid');

    let cases = await this.table
                  .select('case_id')
                  .where('time', '>=', new Date(publication.start_date))
                  .where('time', '<=', new Date(publication.end_date))
                  .groupBy('case_id');
    if (cases) {
      return cases.map(c => c.case_id)
    }
    return []
  }

  /**
   * Insert a group of points with redacted data.
   *
   * @method loadTestRedactedTrails
   * @param {Array} trails
   * @param {Number} caseId
   * @return {Array}
   */
  async insertRedactedTrailSet(trails, caseId) {
    trails = transform.discreetToDuration(trails)
    const trailRecords = trails.map(trail => {
      return {
        hash: null,
        coordinates: this.makeCoordinate(trail.longitude, trail.latitude),
        time: new Date(trail.time * 1000), // Assumes time in epoch seconds
        case_id: caseId,
        duration: trail.duration
      }
    })

    return this.create(trailRecords);
  }

  /**
   * Simply used to test the length of the process for hashing a large set of points.
   *
   * @method loadTestRedactedTrails
   * @param {Array} trails
   * @param {Number} caseId
   * @return {Array}
   */
  async loadTestRedactedTrails(trails, caseId) {
    let trailRecords = [];

    trails = transform.discreetToDuration(trails)

    let trail, record, hash;
    for(trail of trails) {
      record = {};
      hash = await geoHash.encrypt(trail)
      if (hash) {
        record.hash = hash.encodedString
        record.coordinates = this.makeCoordinate(trail.longitude, trail.latitude);
        record.time = new Date(trail.time * 1000); // Assumes time in epoch seconds
        record.case_id = caseId;
        record.duration = trail.duration;
        trailRecords.push(record);
      }
    }

    return trailRecords
  }

  /**
   * Needed to generate Hashes and timestamps of postgis for sinon stubs in tests.
   *
   * @method loadTestRedactedTrails
   * @param {Number} longitude
   * @param {Number} latitude
   * @return {Object}
   */
  async fetchTestHash(longitude, latitude) {
    const results = await this.raw(`SELECT ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}),4326) AS point, now() AS time`);
    if (results) {
      return results.rows[0];
    }
    return null;
  }

}

module.exports = new Service('points');
