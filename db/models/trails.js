const BaseService = require('../common/service.js');
const knex = require('../knex.js');
const knexPostgis = require("knex-postgis");
const wkx = require('wkx');
const Buffer = require('buffer').Buffer;
const geoHash = require('../../app/lib/geoHash');

const st = knexPostgis(knex);

class Service extends BaseService {

  findInterval(publication) {
    if (!publication.id) throw new Error('Publication ID is invalid');
    if (!publication.start_date) throw new Error('Start date is invalid');
    if (!publication.end_date) throw new Error('Start date is invalid');

    return knex(this._name)
      .whereIn('case_id', publication.cases)
      .where('time', '>=', new Date(publication.start_date))
      .where('time', '<=', new Date(publication.end_date));
  }

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

module.exports = new Service('trails');