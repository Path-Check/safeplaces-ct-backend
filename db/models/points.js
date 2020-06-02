const BaseService = require('../common/service.js');
const Buffer = require('buffer').Buffer;

const knex = require('../knex.js').private;
const knexPostgis = require("knex-postgis");
const wkx = require('wkx');
const geoHash = require('../../app/lib/geoHash');

const st = knexPostgis(knex);

class Service extends BaseService {

  /**
   * Fetch All Points and run through Redaction.
   *
   * @method _getRedactedPoints
   * @param {String} case_id
   * @return {Array}
   */
  async fetchRedactedPoints(case_id) {
    if (!case_id) throw new Error('Case ID is invalid')

    const points = await this.find({ case_id })
    if (points) {
      return this._getRedactedPoints(points)
    }
    throw new Error('Could not find redacted points.')
  }

  async createRedactedPoint(caseId, point) {
    let record = {};
    let hash = await geoHash.encrypt(point)
    if (hash) {
      record.hash = hash.encodedString
      record.coordinates = this.makeCoordinate(point.longitude, point.latitude);
      record.time = new Date(point.time); // Assumes time in epoch seconds
      record.case_id = caseId;
      const points = await this.create(record);
      if (points) {
        return this._getRedactedPoints(points).shift()
      }
    }
    throw new Error('Could not create hash.')
  }

  async createPointsFromUpload(caseId, uploadedPoints) {
    if (!caseId) throw new Error('Case ID is invalid');
    if (!uploadedPoints) throw new Error('Uploaded points are invalid');

    uploadedPoints.forEach(point => {
      delete point.id;
      point.case_id = caseId;
    });

    const points = await this.create(uploadedPoints);

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
    let record = {};
    let hash = await geoHash.encrypt(point)
    if (hash) {
      record.hash = hash.encodedString
      record.coordinates = this.makeCoordinate(point.longitude, point.latitude);
      record.time = new Date(point.time);
      const points = await this.updateOne(point_id, record);
      if (points) {
        return this._getRedactedPoints([points]).shift()
      }
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
      trail.caseId = point.caseId || null
      trail.pointId = point.pointId || point.id
      trail.longitude = c.x;
      trail.latitude = c.y;
      if (includeHash) trail.hash = point.hash;
      trail.time = (point.time.getTime() / 1000);
      if (returnDateTime) trail.time = point.time
      redactedTrail.push(trail);
    });

    return redactedTrail;
  }

  // findInterval(publication) {
  //   if (!publication.id) throw new Error('Publication ID is invalid');
  //   if (!publication.start_date) throw new Error('Start date is invalid');
  //   if (!publication.end_date) throw new Error('Start date is invalid');

  //   return this.table
  //     .whereIn('case_id', publication.cases)
  //     .where('time', '>=', new Date(publication.start_date))
  //     .where('time', '<=', new Date(publication.end_date));
  // }

  async findIntervalCases(publication) {
    if (!publication.start_date) throw new Error('Start date is invalid');
    if (!publication.end_date) throw new Error('Start date is invalid');

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

  async insertRedactedTrailSet(trails, caseId) {
    let trailRecords = [];

    let trail, record, hash;
    for(trail of trails) {
      record = {};
      hash = await geoHash.encrypt(trail)
      if (hash) {
        record.hash = hash.encodedString
        record.coordinates = this.makeCoordinate(trail.longitude, trail.latitude);
        record.time = new Date(trail.time * 1000); // Assumes time in epoch seconds
        record.case_id = caseId;
        trailRecords.push(record);
      }
    }

    return this.create(trailRecords);
  }

}

module.exports = new Service('points');
