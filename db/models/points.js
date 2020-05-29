const BaseService = require('../common/service.js');
const knex = require('../knex.js');
const knexPostgis = require("knex-postgis");
const wkx = require('wkx');
const Buffer = require('buffer').Buffer;
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

  async createRedactdPoint(caseId, point) {
    let record = {};
    let hash = await geoHash.encrypt(point)
    if (hash) {
      record.hash = hash.encodedString
      record.coordinates = st.setSRID(
        st.makePoint(point.longitude, point.latitude), 4326);
      record.time = new Date(point.time); // Assumes time in epoch seconds
      record.case_id = caseId;
      const points = await this.create(record);
      if (points) {
        return this._getRedactedPoints(points).shift()
      }
    }
    throw new Error('Could not create hash.')
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
      record.coordinates = st.setSRID(
        st.makePoint(point.longitude, point.latitude), 4326);
      record.time = new Date(point.time);
      const points = await this.updateOne(point_id, record);
      if (points) {
        return this._getRedactedPoints([points]).shift()
      }
    }
    throw new Error('Could not create hash.')
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

  //   return knex(this._name)
  //     .whereIn('case_id', publication.cases)
  //     .where('time', '>=', new Date(publication.start_date))
  //     .where('time', '<=', new Date(publication.end_date));
  // }

  async findIntervalCases(publication) {
    if (!publication.start_date) throw new Error('Start date is invalid');
    if (!publication.end_date) throw new Error('Start date is invalid');

    let cases = await knex(this._name)
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
        record.coordinates = st.setSRID(
          st.makePoint(trail.longitude, trail.latitude), 4326);
        record.time = new Date(trail.time * 1000); // Assumes time in epoch seconds
        record.case_id = caseId;
        trailRecords.push(record);
      }
    }
    
    return knex(this._name).insert(trailRecords).returning('*');
  }

}

module.exports = new Service('points');