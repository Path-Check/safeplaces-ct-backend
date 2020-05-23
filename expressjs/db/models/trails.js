const BaseService = require('../common/service.js');
const knex = require('../knex.js');
const knexPostgis = require("knex-postgis");
const wkx = require('wkx');
const Buffer = require('buffer').Buffer;

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
      trail.time = element.time.getTime()/1000;
      // identifier = element.redacted_trail_id;
      redactedTrail.push(trail);
    });

    return redactedTrail;
  }
  
  insertRedactedTrailSet(trails, redactedTrailId, organizationId, userId) {
    let trailRecords = [];

    trails.forEach(element => {
      let trailRecord = {};
      trailRecord.coordinates = st.setSRID(
        st.makePoint(element.longitude, element.latitude), 4326);
      trailRecord.time = new Date(element.time * 1000); // Assumes time in epoch seconds
      trailRecord.redacted_trail_id = redactedTrailId;
      trailRecord.organization_id = organizationId;
      trailRecord.user_id = userId;
      trailRecords.push(trailRecord);
    });
    
    return knex(this._name).insert(trailRecords).returning('*');
  }

}

module.exports = new Service('trails');