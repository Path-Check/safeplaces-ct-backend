process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const AdmZip = require('adm-zip');

const mockData = require('../lib/mockData');

const jwtSecret = require('../../config/jwtConfig');
const server = require('../../app');
const trails = require('../../db/models/trails');
const publications = require('../../db/models/publications');

const ORGANISATION_ID = 'a88309c2-26cd-4d2b-8923-af0779e423a3';
const USER_ID = 'a88309ca-26cd-4d2b-8923-af0779e423a3';
const USERNAME = 'admin';
const ADMIN_JWT_TOKEN = jwt.sign(
  {
    sub: USERNAME,
    iat: ~~(Date.now() / 1000),
    exp: ~~(Date.now() / 1000) + (parseInt(process.env.JWT_EXP) || 1 * 60 * 60), // Default expires in an hour
  },
  jwtSecret.secret,
);

chai.use(chaiHttp);

let currentOrg, currentTrails, currentPublication;

describe('Safe Path ', function () {

  describe('GET /safe_path without redacted_trails and with publication', function () {
    before(async () => {
      await trails.deleteAllRows();

      let trail = [
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 123456789,
        },
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 123456789,
        },
      ];
      let identifier = 'a88309c1-26cd-4d2b-8923-af0779e423a3';
      await trails.insertRedactedTrailSet(
        trail,
        identifier,
        ORGANISATION_ID,
        USER_ID,
      );

      await publications.deleteAllRows();

      let publication = {
        organization_id: ORGANISATION_ID,
        user_id: USER_ID,
        start_date: 158494125,
        end_date: 1584924583,
        publish_date: 1584924583,
      };
      await publications.insert(publication);
    });

    after(async function () {
      await publications.deleteAllRows();
    });

    it('returns an organization`s safe paths as empty', function (done) {
      chai
        .request(server.app)
        .get('/safe_path/a88309c2-26cd-4d2b-8923-af0779e423a3')
        .end(function (err, res) {
          res.should.have.status(200);
          res.should.be.json; // jshint ignore:line
          res.body.should.be.a('object');

          const firstChunk = res.body.files.shift()
          firstChunk.should.have.property('authority_name');
          firstChunk.authority_name.should.equal('Test Organization');
          firstChunk.should.have.property('concern_point_hashes');
          firstChunk.concern_point_hashes.should.be.a('array');
          firstChunk.concern_point_hashes.should.be.empty;
          firstChunk.should.have.property('info_website');
          firstChunk.info_website.should.equal(
            'https://www.who.int/emergencies/diseases/novel-coronavirus-2019',
          );
          firstChunk.should.have.property('publish_date_utc');
          firstChunk.publish_date_utc.should.equal(1584924583);
          done();
        });
    });
  });

  describe('GET /safe_path with redacted_trails and without publication', function () {
    const trailIdentifier = 'a88309c1-26cd-4d2b-8923-af0779e423a3';
    before(async function () {
      await trails.deleteAllRows();
      let trail = [
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 1584924123,
        },
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 1584924456,
        },
      ];
      await trails.insertRedactedTrailSet(
        trail,
        trailIdentifier,
        ORGANISATION_ID,
        USER_ID,
      );
    });

    after(async function () {
      await trails.deleteAllRows();
    });

    it('return an organization`s safe paths as empty', function (done) {
      chai
        .request(server.app)
        .get('/safe_path/a88309c2-26cd-4d2b-8923-af0779e423a3')
        .end(function (err, res) {
          res.should.have.status(204);
          res.body.should.be.empty;
          done();
        });
    });
  });

  describe('GET /safe_path with redacted_trails and publication with 1 file', function () {

    before(async function () {
      let identifier = 'a88309c1-26cd-4d2b-8923-af0779e423a3';
      
      await trails.deleteAllRows();
      await publications.deleteAllRows();

      // Add Org
      let orgParams = {
        authority_name: 'My Example Organization',
        info_website: 'http://sample.com',
      };
      currentOrg = await mockData.mockOrganization(orgParams);

      // Add Trails
      let trailsParams = {
        redactedTrailId: identifier,
        organizationId: currentOrg.id,
        userId: USER_ID
      }
      currentTrails = await mockData.mockTrails(5, 3600, trailsParams) // Generate 5 trails 1 hour apart

      let start_date = (new Date(currentTrails[(currentTrails.length - 1)].time).getTime() / 1000)
      let end_date = (new Date(currentTrails[0].time).getTime() / 1000)

      // Add Publication
      let publication = {
        organization_id: currentOrg.id,
        user_id: USER_ID,
        start_date,
        end_date
      };
      currentPublication = await mockData.mockPublication(publication)
    });

    it('return an organization`s chunked safe paths', async function() {
      const res = await chai.request(server.app).get(`/safe_path/${currentOrg.id}`)
      if (res) {
        // console.log(res)
        let pageEndpoint = `${currentOrg.apiEndpoint}[PAGE].json`

        res.should.have.status(200);
        res.should.be.json; // jshint ignore:line
        res.body.should.be.a('object');
        res.body.files.should.be.a('array');

        const firstChunk = res.body.files.shift()
        firstChunk.should.be.a('object');

        firstChunk.should.have.property('authority_name');
        firstChunk.authority_name.should.equal(currentOrg.authority_name);
        firstChunk.should.have.property('notification_threshold_percent');
        firstChunk.should.have.property('notification_threshold_count');
        firstChunk.should.have.property('concern_point_hashes');
        firstChunk.concern_point_hashes.should.be.a('array');
        firstChunk.should.have.property('info_website');
        firstChunk.info_website.should.equal(currentOrg.info_website);
        firstChunk.should.have.property('publish_date_utc');
        firstChunk.publish_date_utc.should.equal((currentPublication.publish_date.getTime() / 1000));
        firstChunk.concern_point_hashes.length.should.equal(5);
        firstChunk.concern_point_hashes.forEach(point => {
          point.should.be.a('string');
        })

        const cursor = res.body.cursor
        cursor.should.be.a('array');

        const firstCursor = res.body.cursor.shift()
        firstCursor.should.be.a('object');
        firstCursor.should.have.property('id');
        firstCursor.id.should.be.a('string');
        firstCursor.should.have.property('startTimestamp');
        firstCursor.startTimestamp.should.be.a('number');
        firstCursor.should.have.property('endTimestamp');
        firstCursor.endTimestamp.should.be.a('number');
        firstCursor.should.have.property('filename');
        firstCursor.filename.should.be.a('string');
        firstCursor.filename.should.equal(pageEndpoint.replace('[PAGE]', `${firstCursor.startTimestamp}_${firstCursor.endTimestamp}`));
      }
    });

    after(async function () {
      await trails.deleteAllRows();
      await publications.deleteAllRows();
    });

  });

  describe('GET /safe_path with redacted_trails and publication with 5 file', function () {

    before(async function () {
      let identifier = 'a88309c1-26cd-4d2b-8923-af0779e423a3';
      
      await trails.deleteAllRows();
      await publications.deleteAllRows();

      // Add Org
      let orgParams = {
        authority_name: 'My Example Organization',
        info_website: 'http://sample.com',
        chunkingInSeconds: 3600
      };
      currentOrg = await mockData.mockOrganization(orgParams);

      // Add Trails
      let trailsParams = {
        redactedTrailId: identifier,
        organizationId: currentOrg.id,
        userId: USER_ID
      }
      currentTrails = await mockData.mockTrails(10, 1800, trailsParams) // Generate 10 trails 30 min apart

      let start_date = (new Date(currentTrails[(currentTrails.length - 1)].time).getTime() / 1000)
      let end_date = (new Date(currentTrails[0].time).getTime() / 1000)

      // Add Publication
      let publication = {
        organization_id: currentOrg.id,
        user_id: USER_ID,
        start_date,
        end_date
      };
      currentPublication = await mockData.mockPublication(publication)
    });

    it('return an organization`s safe paths with 5 files', async function() {
      const res = await chai.request(server.app).get(`/safe_path/${currentOrg.id}`)
      if (res) {
        let pageEndpoint = `${currentOrg.apiEndpoint}[PAGE].json`
        res.should.have.status(200);
        res.should.be.json; // jshint ignore:line
        res.body.should.be.a('object');
        res.body.files.length.should.equal(5);
        res.body.cursor.length.should.equal(5);
        
        const testCursorOne = res.body.cursor[0]
        testCursorOne.filename.should.equal(pageEndpoint.replace('[PAGE]', `${testCursorOne.startTimestamp}_${testCursorOne.endTimestamp}`));

        const testCursorFive = res.body.cursor[4]
        testCursorFive.filename.should.equal(pageEndpoint.replace('[PAGE]', `${testCursorFive.startTimestamp}_${testCursorFive.endTimestamp}`));
      }
    });

    after(async function () {
      await trails.deleteAllRows();
      await publications.deleteAllRows();
    });

  });

  describe('GET /safe_path as zip file', function () {

    before(async function () {
      let identifier = 'a88309c1-26cd-4d2b-8923-af0779e423a3';
      
      await trails.deleteAllRows();
      await publications.deleteAllRows();

      // Add Org
      let orgParams = {
        authority_name: 'My Example Organization',
        info_website: 'http://sample.com',
        chunkingInSeconds: 3600
      };
      currentOrg = await mockData.mockOrganization(orgParams);

      // Add Trails
      let trailsParams = {
        redactedTrailId: identifier,
        organizationId: currentOrg.id,
        userId: USER_ID
      }
      currentTrails = await mockData.mockTrails(10, 1800, trailsParams) // Generate 10 trails 30 min apart

      let start_date = (new Date(currentTrails[(currentTrails.length - 1)].time).getTime() / 1000)
      let end_date = (new Date(currentTrails[0].time).getTime() / 1000)

      // Add Publication
      let publication = {
        organization_id: currentOrg.id,
        user_id: USER_ID,
        start_date,
        end_date
      };
      currentPublication = await mockData.mockPublication(publication)
    });

    it('return an organization`s safe paths with 5 files', async function() {
      const res = await chai.request(server.app).get(`/safe_path/${currentOrg.id}?type=zip`).buffer()
      if (res) {
        var zip = new AdmZip(res.body);
        var zipEntries = zip.getEntries();

        res.should.have.status(200);
        res.headers['content-type'].should.equal('application/octet-stream')
        res.headers['content-disposition'].should.equal(`attachment; filename="${currentPublication.id}.zip"`)
        zipEntries.length.should.equal(8)
        const doesCursorExist = zipEntries.find(itm => itm.entryName.indexOf('cursor.json') >= 0)
        doesCursorExist.entryName.should.equal('trails/cursor.json')

        const cursorData = JSON.parse(doesCursorExist.getData().toString())
        cursorData.length.should.equal(5)
      }
    });

    after(async function () {
      await trails.deleteAllRows();
      await publications.deleteAllRows();
    });

  });

  describe('POST /safe_paths with redacted trails and start_date, end_date respects interval', function () {
    before(async function () {
      await trails.deleteAllRows();
      let trail = [
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 1584924123,
        },
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 1584924456,
        },
      ];
      let identifier = 'a88309c1-26cd-4d2b-8923-af0779e423a3';
      await trails.insertRedactedTrailSet(
        trail,
        identifier,
        ORGANISATION_ID,
        USER_ID,
      );
    });

    after(async function () {
      await trails.deleteAllRows();
      await publications.deleteAllRows();
    });

    it('should accept safe path being submitted', function (done) {
      chai
        .request(server.app)
        .post('/safe_paths')
        .send({
          authority_name: 'Test Organization',
          publish_date: 1584924583,
          info_website:
            'https://www.who.int/emergencies/diseases/novel-coronavirus-2019',
          safe_path_json:
            'https://www.something.give/safe_path/a88309c2-26cd-4d2b-8923-af0779e423a3',
          start_date: 158494125,
          end_date: 1584924300,
          concern_points: [
            {
              time: 1584924123,
              latitude: 12.34,
              longitude: 12.34,
            },
            {
              time: 1584924456,
              latitude: 12.34,
              longitude: 12.34,
            },
          ],
        })
        .set('Authorization', `${ADMIN_JWT_TOKEN}`)
        .end(function (err, res) {
          res.should.have.status(200);
          res.should.be.json; // jshint ignore:line
          res.body.should.be.a('object');
          res.body.should.have.property('datetime_created');
          chai.assert.equal(
            new Date(res.body.datetime_created) instanceof Date,
            true,
          );
          res.body.should.have.property('organization_id');
          res.body.organization_id.should.equal(
            'a88309c2-26cd-4d2b-8923-af0779e423a3',
          );
          res.body.should.have.property('user_id');
          res.body.user_id.should.equal('a88309ca-26cd-4d2b-8923-af0779e423a3');
          res.body.should.have.property('safe_path');
          res.body.safe_path.should.be.a('object');

          const firstChunk = res.body.safe_path.files.shift()
          firstChunk.should.be.a('object');

          firstChunk.should.have.property('authority_name');
          firstChunk.authority_name.should.equal('Test Organization');
          firstChunk.should.have.property('concern_point_hashes');
          firstChunk.concern_point_hashes.should.be.a('array');
          firstChunk.concern_point_hashes.length.should.equal(1);
          firstChunk.concern_point_hashes[0].should.be.a('string');
          firstChunk.should.have.property('info_website');
          firstChunk.info_website.should.equal(
            'https://www.who.int/emergencies/diseases/novel-coronavirus-2019',
          );
          firstChunk.should.have.property('publish_date_utc');
          firstChunk.publish_date_utc.should.equal(1584924583);
          done();
        });
    });
  });

  describe('POST /safe_paths with redacted trails', function () {
    before(async function () {
      await trails.deleteAllRows();
      let trail = [
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 1584924123,
        },
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 1584924456,
        },
      ];
      let identifier = 'a88309c1-26cd-4d2b-8923-af0779e423a3';
      await trails.insertRedactedTrailSet(
        trail,
        identifier,
        ORGANISATION_ID,
        USER_ID,
      );
    });

    after(async function () {
      await trails.deleteAllRows();
      await publications.deleteAllRows();
    });

    it('should accept safe path being submitted', function (done) {
      chai
        .request(server.app)
        .post('/safe_paths')
        .send({
          authority_name: 'Test Organization',
          publish_date: 1584924583,
          info_website:
            'https://www.who.int/emergencies/diseases/novel-coronavirus-2019',
          safe_path_json:
            'https://www.something.give/safe_path/a88309c2-26cd-4d2b-8923-af0779e423a3',
          start_date: 158494125,
          end_date: 1584924583,
          concern_points: [
            {
              time: 1584924123,
              latitude: 12.34,
              longitude: 12.34,
            },
            {
              time: 1584924456,
              latitude: 12.34,
              longitude: 12.34,
            },
          ],
        })
        .set('Authorization', `${ADMIN_JWT_TOKEN}`)
        .end(function (err, res) {
          res.should.have.status(200);
          res.should.be.json; // jshint ignore:line
          res.body.should.be.a('object');
          res.body.should.have.property('datetime_created');
          chai.assert.equal(
            new Date(res.body.datetime_created) instanceof Date,
            true,
          );
          res.body.should.have.property('organization_id');
          res.body.organization_id.should.equal(
            'a88309c2-26cd-4d2b-8923-af0779e423a3',
          );
          res.body.should.have.property('user_id');
          res.body.user_id.should.equal('a88309ca-26cd-4d2b-8923-af0779e423a3');
          res.body.should.have.property('safe_path');

          const firstChunk = res.body.safe_path.files.shift()
          firstChunk.should.be.a('object');

          firstChunk.should.have.property('authority_name');
          firstChunk.authority_name.should.equal('Test Organization');
          firstChunk.should.have.property('concern_point_hashes');
          firstChunk.concern_point_hashes.should.be.a('array');
          firstChunk.concern_point_hashes.length.should.equal(2);
          firstChunk.concern_point_hashes[0].should.be.a('string');
          firstChunk.should.have.property('info_website');
          firstChunk.info_website.should.equal(
            'https://www.who.int/emergencies/diseases/novel-coronavirus-2019',
          );
          firstChunk.should.have.property('publish_date_utc');
          firstChunk.publish_date_utc.should.equal(1584924583);
          done();
        });
    });
  });

});
