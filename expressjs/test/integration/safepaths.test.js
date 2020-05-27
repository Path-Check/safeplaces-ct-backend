process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

const { v4: uuidv4 } = require('uuid');
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const AdmZip = require('adm-zip');

const mockData = require('../lib/mockData');

const jwtSecret = require('../../config/jwtConfig');
const server = require('../../app');
const users = require('../../db/models/users');
const organizations = require('../../db/models/organizations');
const trails = require('../../db/models/trails');
const publications = require('../../db/models/publications');
const cases = require('../../db/models/cases');

// const ORGANISATION_ID = 'a88309c2-26cd-4d2b-8923-af0779e423a3';
// const USER_ID = 'a88309ca-26cd-4d2b-8923-af0779e423a3';
// const USERNAME = 'admin';
// const 

chai.use(chaiHttp);

let currentOrg, currentTrails, currentPublication, token, start_date, end_date;

describe('Safe Path ', function () {

  before(async () => {
    let orgParams = {
      id: uuidv4(),
      name: 'My Example Organization',
      info_website_url: 'http://sample.com',
    };
    currentOrg = await mockData.mockOrganization(orgParams);
  
    let newUserParams = {
      username: 'myAwesomeUser',
      password: 'myAwesomePassword',
      email: 'myAwesomeUser@yomanbob.com',
      organization_id: currentOrg.id,
    };
    await mockData.mockUser(newUserParams);
  
    token = jwt.sign(
      {
        sub: newUserParams.username,
        iat: ~~(Date.now() / 1000),
        exp: ~~(Date.now() / 1000) + (parseInt(process.env.JWT_EXP) || 1 * 60 * 60), // Default expires in an hour
      },
      jwtSecret.secret,
    );
  });

  describe('GET /safe_path without redacted_trails and with publication', function () {
    before(async () => {

      const caseParams = {
        organization_id: currentOrg.id,
        state: 'unpublished'
      };

      const mockCase = await mockData.mockCase(caseParams)

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
      
      await trails.insertRedactedTrailSet(trail, mockCase.id);

      const  publicationParams = {
        organization_id: currentOrg.id,
        start_date: 158494125,
        end_date: 1584924583,
        publish_date: 1584924583,
      };
      currentPublication = await mockData.mockPublication(publicationParams)
    });

    after(async function () {
      await cases.deleteAllRows();
      await trails.deleteAllRows();
      await publications.deleteAllRows();
    });

    it('returns an organization`s safe paths as empty', function (done) {
      chai
        .request(server.app)
        .get(`/safe_path/${currentOrg.id}`)
        .end(function (err, res) {
          // console.log(res.text)
          res.should.have.status(200);
          res.should.be.json; // jshint ignore:line
          res.body.should.be.a('object');

          const firstChunk = res.body.files.shift()
          firstChunk.should.have.property('name');
          firstChunk.name.should.equal(currentOrg.name);
          firstChunk.should.have.property('concern_point_hashes');
          firstChunk.concern_point_hashes.should.be.a('array');
          firstChunk.concern_point_hashes.should.be.empty;
          firstChunk.should.have.property('info_website_url');
          firstChunk.info_website_url.should.equal(currentOrg.info_website_url);
          firstChunk.should.have.property('publish_date_utc');
          done();
        });
    });
  });

  describe('GET /safe_path with redacted_trails and without publication', function () {
    before(async function () {
      const caseParams = {
        organization_id: currentOrg.id,
        state: 'unpublished'
      };
      const mockCase = await mockData.mockCase(caseParams)

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
      await trails.insertRedactedTrailSet(trail, mockCase.id);
    });

    after(async function () {
      await cases.deleteAllRows();
      await trails.deleteAllRows();
    });

    it('return an organization`s safe paths as empty', function (done) {
      chai
        .request(server.app)
        .get(`/safe_path/${currentOrg.id}`)
        .end(function (err, res) {
          res.should.have.status(204);
          res.body.should.be.empty;
          done();
        });
    });
  });

  describe('GET /safe_path with redacted_trails and publication with 1 file', function () {

    before(async function () {
      const caseParams = {
        organization_id: currentOrg.id,
        state: 'published'
      };
      const mockCase = await mockData.mockCase(caseParams)

      // Add Trails
      let trailsParams = {
        caseId: mockCase.id
      }
      currentTrails = await mockData.mockTrails(5, 3600, trailsParams) // Generate 5 trails 1 hour apart

      let start_date = (new Date(currentTrails[(currentTrails.length - 1)].time).getTime() / 1000)
      let end_date = (new Date(currentTrails[0].time).getTime() / 1000)

      // Add Publication
      let publication = {
        organization_id: currentOrg.id,
        start_date,
        end_date
      };
      currentPublication = await mockData.mockPublication(publication)
    });

    it('return an organization`s chunked safe paths', async function() {
      const res = await chai.request(server.app).get(`/safe_path/${currentOrg.id}`)
      if (res) {
        let pageEndpoint = `${currentOrg.api_endpoint_url}[PAGE].json`

        res.should.have.status(200);
        res.should.be.json; // jshint ignore:line
        res.body.should.be.a('object');
        res.body.files.should.be.a('array');

        const firstChunk = res.body.files.shift()
        firstChunk.should.be.a('object');

        firstChunk.should.have.property('name');
        firstChunk.name.should.equal(currentOrg.name);
        firstChunk.should.have.property('notification_threshold_percent');
        firstChunk.should.have.property('notification_threshold_count');
        firstChunk.should.have.property('concern_point_hashes');
        firstChunk.concern_point_hashes.should.be.a('array');
        firstChunk.should.have.property('info_website_url');
        firstChunk.info_website_url.should.equal(currentOrg.info_website_url);
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
      await cases.deleteAllRows();
      await trails.deleteAllRows();
      await publications.deleteAllRows();
    });

  });

  describe('GET /safe_path with redacted_trails and publication with 5 file', function () {

    before(async function () {
      await organizations.deleteAllRows()

      // Add Org
      let orgParams = {
        id: uuidv4(),
        name: 'My Example Organization',
        info_website_url: 'http://sample.com',
        chunking_in_seconds: 3600
      };
      currentOrg = await mockData.mockOrganization(orgParams);

      const caseParams = {
        organization_id: currentOrg.id,
        state: 'published'
      };
      const mockCase = await mockData.mockCase(caseParams)

      // Add Trails
      let trailsParams = {
        caseId: mockCase.id
      }
      currentTrails = await mockData.mockTrails(10, 1800, trailsParams) // Generate 10 trails 30 min apart

      let start_date = (new Date(currentTrails[(currentTrails.length - 1)].time).getTime() / 1000)
      let end_date = (new Date(currentTrails[0].time).getTime() / 1000)

      // Add Publication
      let publication = {
        organization_id: currentOrg.id,
        start_date,
        end_date
      };
      currentPublication = await mockData.mockPublication(publication)
    });

    it('return an organization`s safe paths with 5 files', async function() {
      const res = await chai.request(server.app).get(`/safe_path/${currentOrg.id}`)
      if (res) {
        let pageEndpoint = `${currentOrg.api_endpoint_url}[PAGE].json`
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
      await cases.deleteAllRows();
      await trails.deleteAllRows();
      await publications.deleteAllRows();
    });

  });

  describe('GET /safe_path as zip file', function () {

    before(async function () {
      await organizations.deleteAllRows()

      // Add Org
      let orgParams = {
        id: uuidv4(),
        name: 'My Example Organization',
        info_website_url: 'http://sample.com',
        chunking_in_seconds: 3600
      };
      currentOrg = await mockData.mockOrganization(orgParams);

      const caseParams = {
        organization_id: currentOrg.id,
        state: 'published'
      };
      const mockCase = await mockData.mockCase(caseParams)

      // Add Trails
      let trailsParams = {
        caseId: mockCase.id
      }
      currentTrails = await mockData.mockTrails(10, 1800, trailsParams) // Generate 10 trails 30 min apart

      let start_date = (new Date(currentTrails[(currentTrails.length - 1)].time).getTime() / 1000)
      let end_date = (new Date(currentTrails[0].time).getTime() / 1000)

      // Add Publication
      let publication = {
        organization_id: currentOrg.id,
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
      await users.deleteAllRows()
      await organizations.deleteAllRows()
      let orgParams = {
        id: uuidv4(),
        name: 'My Example Organization',
        info_website_url: 'http://sample.com',
      };
      currentOrg = await mockData.mockOrganization(orgParams);
    
      let newUserParams = {
        username: 'myAwesomeUser',
        password: 'myAwesomePassword',
        email: 'myAwesomeUser@yomanbob.com',
        organization_id: currentOrg.id,
      };
      await mockData.mockUser(newUserParams);
    
      token = jwt.sign(
        {
          sub: newUserParams.username,
          iat: ~~(Date.now() / 1000),
          exp: ~~(Date.now() / 1000) + (parseInt(process.env.JWT_EXP) || 1 * 60 * 60), // Default expires in an hour
        },
        jwtSecret.secret,
      );
      const caseParams = {
        organization_id: currentOrg.id,
        state: 'unpublished'
      };
      const mockCase = await mockData.mockCase(caseParams)

      let trailsParams = {
        caseId: mockCase.id
      }
      currentTrails = await mockData.mockTrails(10, 1800, trailsParams) // Generate 10 trails 30 min apart

      start_date = (new Date(currentTrails[(currentTrails.length - 1)].time).getTime() / 1000)
      end_date = (new Date(currentTrails[0].time).getTime() / 1000)
    });

    after(async function () {
      await cases.deleteAllRows();
      await trails.deleteAllRows();
      await publications.deleteAllRows();
    });

    it('should accept safe path being submitted', function (done) {
      chai
        .request(server.app)
        .post('/safe_paths')
        .send({
          publish_date: 1584924583,
          start_date,
          end_date
        })
        .set('Authorization', `${token}`)
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
          res.body.should.have.property('safe_path');
          res.body.safe_path.should.be.a('object');

          const firstChunk = res.body.safe_path.files.shift()
          firstChunk.should.be.a('object');

          firstChunk.should.have.property('name');
          firstChunk.name.should.equal(currentOrg.name);
          firstChunk.should.have.property('concern_point_hashes');
          firstChunk.concern_point_hashes.should.be.a('array');
          firstChunk.concern_point_hashes.length.should.equal(10);
          firstChunk.concern_point_hashes[0].should.be.a('string');
          firstChunk.should.have.property('info_website_url');
          firstChunk.info_website_url.should.equal(currentOrg.info_website_url);
          firstChunk.should.have.property('publish_date_utc');
          firstChunk.publish_date_utc.should.equal(1584924583);
          done();
        });
    });
  });

});
