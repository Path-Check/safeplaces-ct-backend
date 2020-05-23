const BaseService = require('../common/service.js');
const knex = require('../knex.js');
const knexPostgis = require("knex-postgis");
const wkx = require('wkx');
const Buffer = require('buffer').Buffer;
const geoHash = require('../../app/lib/geoHash');

const st = knexPostgis(knex);

class Service extends BaseService {

  findInterval(timeSlice) {
    if (!timeSlice.start_date) throw new Error('Start date is invalid');
    if (!timeSlice.end_date) throw new Error('Start date is invalid');
    
    return knex(this._name)
      .where('time', '>=', new Date(timeSlice.start_date * 1000))
      .where('time', '<=', new Date(timeSlice.end_date * 1000));
  }
  
  
  getRedactedTrailFromRecord(trails) {
    let redactedTrail = [];

    trails.forEach(element => {
      let trail = {};
      const b = new Buffer.from(element.coordinates, 'hex');
      const c = wkx.Geometry.parse(b);
      trail.longitude = c.x;
      trail.latitude = c.y;
      trail.hash = element.hash;
      trail.time = (element.time.getTime() / 1000);
      redactedTrail.push(trail);
    });

    return redactedTrail;
  }
  
  async insertRedactedTrailSet(trails, redactedTrailId, organizationId, userId) {
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
        record.redacted_trail_id = redactedTrailId;
        record.organization_id = organizationId;
        record.user_id = userId;
        trailRecords.push(record);
      }
    }
    
    return knex(this._name).insert(trailRecords).returning('*');
  }

}

module.exports = new Service('trails');