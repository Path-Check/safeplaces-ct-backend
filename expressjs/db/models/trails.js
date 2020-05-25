var knex = require('../knex.js');
const knexPostgis = require('knex-postgis');
const st = knexPostgis(knex);
var wkx = require('wkx');
var Buffer = require('buffer').Buffer;

function Trails() {
  return knex('trails');
}

// *** queries *** //

function find(filter) {
  return Trails()
    .where(filter)
    .then(rows => rows);
}

function findInterval(timeSlice) {
  return Trails()
    .where('time', '>=', new Date(timeSlice.start_date * 1000))
    .where('time', '<=', new Date(timeSlice.end_date * 1000))
    .then(rows => rows);
}

function getAll() {
  return Trails().select();
}

function getRedactedTrailFromRecord(trails) {
  let redactedTrail = [];
  trails.forEach(element => {
    let trail = {};
    const b = new Buffer.from(element.coordinates, 'hex');
    const c = wkx.Geometry.parse(b);
    trail.longitude = c.x;
    trail.latitude = c.y;
    trail.time = element.time.getTime() / 1000;
    // identifier = element.redacted_trail_id;
    redactedTrail.push(trail);
  });
  return redactedTrail;
}

function insertRedactedTrailSet(
  trails,
  redactedTrailId,
  organizationId,
  userId,
) {
  let trailRecords = [];
  trails.forEach(element => {
    let trailRecord = {};
    trailRecord.coordinates = st.setSRID(
      st.makePoint(element.longitude, element.latitude),
      4326,
    );
    trailRecord.time = new Date(element.time * 1000); // Assumes time in epoch seconds
    trailRecord.redacted_trail_id = redactedTrailId;
    trailRecord.organization_id = organizationId;
    trailRecord.user_id = userId;
    trailRecords.push(trailRecord);
  });
  return Trails().insert(trailRecords).returning('*');
}

function deleteTable() {
  return Trails().del();
}

module.exports = {
  find: find,
  findInterval: findInterval,
  getAll: getAll,
  getRedactedTrailFromRecord: getRedactedTrailFromRecord,
  insertRedactedTrailSet: insertRedactedTrailSet,
  deleteTable: deleteTable,
};
