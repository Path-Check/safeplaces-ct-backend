process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

const _ = require('lodash');
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const mockData = require('../lib/mockData');

const server = require('../../app');
const casesService = require('../../db/models/cases');
const pointsService = require('../../db/models/points');

const jwtSecret = require('../../config/jwtConfig');

const type = (process.env.GOOGLE_APPLICATION_CREDENTIALS) ? 'default' : 'local';

chai.use(chaiHttp);

let currentOrg, currentCase, token;

describe('Case', () => {

  before(async () => {
    await mockData.clearMockData()
    
    let orgParams = {
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
        exp:
          ~~(Date.now() / 1000) + (parseInt(process.env.JWT_EXP) || 1 * 60 * 60), // Default expires in an hour
      },
      jwtSecret.secret,
    );

    const caseParams = {
      organization_id: currentOrg.id,
      state: 'unpublished'
    };

    currentCase = await mockData.mockCase(caseParams)
  });

  describe('fetch case points', () => {

    before(async () => {
      await casesService.deleteAllRows()

      const caseParams = {
        organization_id: currentOrg.id,
        state: 'published'
      };
      currentCase = await mockData.mockCase(caseParams)

      // Add Trails
      let trailsParams = {
        caseId: currentCase.id
      }
      await mockData.mockTrails(10, 1800, trailsParams) // Generate 10 trails 30 min apart
    });

    it('and return multiple case points', async () => {
      const results = await chai
        .request(server.app)
        .get(`/case/points?caseId=${currentCase.id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json');

      results.error.should.be.false;
      results.should.have.status(200);
      results.body.should.be.a('object');
      results.body.should.have.property('concernPoints');
      results.body.concernPoints.should.be.a('array');
      results.body.concernPoints.length.should.equal(10);

      const firstChunk = results.body.concernPoints.shift()
      firstChunk.should.have.property('pointId');
      firstChunk.should.have.property('longitude');
      firstChunk.should.have.property('latitude');
      firstChunk.should.have.property('time');

    });
  });

  describe('add a single point on a case', () => {

    before(async () => {
      await casesService.deleteAllRows()

      const caseParams = {
        organization_id: currentOrg.id,
        state: 'published'
      };
      currentCase = await mockData.mockCase(caseParams)
    });

    it('and return the newly created point', async () => {
      const newParams = {
        caseId: currentCase.id,
        point: {
          longitude: 14.91328448,
          latitude: 41.24060321,
          time: "2020-05-01T18:25:43.511Z"
        }
      };

      const results = await chai
        .request(server.app)
        .post(`/case/point`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send(newParams);

      results.error.should.be.false;
      results.should.have.status(200);
      results.body.should.be.a('object');
      results.body.should.have.property('concernPoint');
      results.body.concernPoint.should.be.a('object');
      results.body.concernPoint.should.have.property('pointId');
      results.body.concernPoint.should.have.property('longitude');
      results.body.concernPoint.should.have.property('latitude');
      results.body.concernPoint.should.have.property('time');
      results.body.concernPoint.longitude.should.equal(newParams.point.longitude);
      results.body.concernPoint.latitude.should.equal(newParams.point.latitude);
      results.body.concernPoint.time.should.equal(newParams.point.time);
    });
  });

  it('add user consent to publish', async () => {
    // const newParams = {
    //   caseId: caseToTestStaging.id,
    // };

    // const results = await chai
    //   .request(server.app)
    //   .post(`/case/consent-to-publishing`)
    //   .set('Authorization', `Bearer ${token}`)
    //   .set('content-type', 'application/json')
    //   .send(newParams);
      
    // results.should.have.status(200);
  });

  describe('move a case to staging', () => {

    before(async () => {
      await casesService.deleteAllRows()

      const caseParams = {
        organization_id: currentOrg.id,
        state: 'published'
      };
      currentCase = await mockData.mockCase(caseParams)
    });

    it('return the updated case', async () => {
      const newParams = {
        caseId: currentCase.id,
      };

      const results = await chai
        .request(server.app)
        .post(`/case/stage`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send(newParams);

        results.error.should.be.false;
        results.should.have.status(200);
        results.body.should.be.a('object');
        results.body.should.have.property('case');
        results.body.case.should.be.a('object');
        results.body.case.should.have.property('caseId');
        results.body.case.should.have.property('state');
        results.body.case.should.have.property('updatedAt');
        results.body.case.should.have.property('expiresAt');
        results.body.case.caseId.should.equal(currentCase.id);
        results.body.case.state.should.equal('staging');
    });
  });

  describe('publish a case(s)', () => {

    let caseOne, caseTwo, caseThree
    
    beforeEach(async () => {
      await casesService.deleteAllRows()
      await pointsService.deleteAllRows()
  
      let params = {
        organization_id: currentOrg.id,
        number_of_trails: 10,
        seconds_apart: 1800,
        state: 'staging'
      };
  
      caseOne = await mockData.mockCaseAndTrails(params)
      caseTwo = await mockData.mockCaseAndTrails(params)
      caseThree = await mockData.mockCaseAndTrails(params)
    });
      
    it(`returns multiple published cases (${type})`, async () => {
      const newParams = {
        caseIds: [caseOne.id, caseTwo.id, caseThree.id],
      };

      const results = await chai
        .request(server.app)
        .post(`/cases/publish?type=${type}`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send(newParams);

      results.error.should.be.false;
      results.should.have.status(200);
      results.body.should.be.a('object');
      results.body.should.have.property('cases');
      results.body.cases.should.be.a('array');

      results.body.cases.forEach(c => {
        c.should.have.property('caseId');
        c.state.should.be.equal('published');
        c.should.have.property('state');
        c.should.have.property('updatedAt');
        c.should.have.property('expiresAt');
      })

    });

    it('returns test json to validate contents of file', async () => {
      const newParams = {
        caseIds: [caseOne.id, caseTwo.id, caseThree.id],
      };

      const results = await chai
        .request(server.app)
        .post(`/cases/publish?type=json`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send(newParams);

      let pageEndpoint = `${currentOrg.apiEndpointUrl}[PAGE].json`
      
      results.error.should.be.false;
      results.should.have.status(200);
      results.body.should.be.a('object');

      results.body.files.should.be.a('array');

      const firstChunk = results.body.files.shift()
      firstChunk.should.be.a('object');

      firstChunk.should.have.property('name');
      firstChunk.should.have.property('notification_threshold_percent');
      firstChunk.should.have.property('notification_threshold_count');
      firstChunk.should.have.property('concern_point_hashes');
      firstChunk.should.have.property('info_website_url');
      firstChunk.should.have.property('publish_date_utc');
      firstChunk.name.should.equal(currentOrg.name);
      firstChunk.info_website_url.should.equal(currentOrg.infoWebsiteUrl);

      firstChunk.concern_point_hashes.should.be.a('array');
      firstChunk.concern_point_hashes.length.should.equal(30);
      firstChunk.concern_point_hashes.forEach(point => {
        point.should.be.a('string');
      })

      const firstCursor = results.body.cursor.shift()
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
    });
  });

  describe('honors expires at on previously published case', () => {

    let caseTwo, caseThree
    
    beforeEach(async () => {
      await casesService.deleteAllRows()
      await pointsService.deleteAllRows()
  
      let params = {
        organization_id: currentOrg.id,
        number_of_trails: 10,
        seconds_apart: 1800
      };

      let invalidDate = (new Date().getTime() - (86400 * 90 * 1000)) // Two months ago
      
      await mockData.mockCaseAndTrails(_.extend(params, { state: 'published', expires_at: invalidDate }))
      caseTwo = await mockData.mockCaseAndTrails(_.extend(params, { state: 'staging', expires_at: null }))
      caseThree = await mockData.mockCaseAndTrails(_.extend(params, { state: 'staging', expires_at: null }))
    });
      
    it(`returns only 2 of the 3 cases entered (${type})`, async () => {
      const newParams = {
        caseIds: [caseTwo.id, caseThree.id],
      };

      const results = await chai
        .request(server.app)
        .post(`/cases/publish?type=${type}`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send(newParams);
        
      results.error.should.be.false;
      results.should.have.status(200);
      results.body.should.be.a('object');
      results.body.should.have.property('cases');
      results.body.cases.should.be.a('array');
      results.body.cases.length.should.be.equal(2);
    });

    it('returns only points from 2 of the 3 cases entered', async () => {
      const newParams = {
        caseIds: [caseTwo.id, caseThree.id],
      };

      const results = await chai
        .request(server.app)
        .post(`/cases/publish?type=json`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send(newParams);
        
      results.error.should.be.false;
      results.should.have.status(200);
      results.body.should.be.a('object');
      results.body.files[0].concern_point_hashes.length.should.equal(20);
    });
    
  });

  describe('fails because one of the cases is set to unpublished', () => {

    let caseOneInvalid, caseTwo, caseThree
    
    beforeEach(async () => {
      await casesService.deleteAllRows()
      await pointsService.deleteAllRows()
  
      let params = {
        organization_id: currentOrg.id,
        number_of_trails: 10,
        seconds_apart: 1800,
        state: 'staging'
      };
  
      caseOneInvalid = await mockData.mockCaseAndTrails(_.extend(params, { state: 'unpublished' }))
      caseTwo = await mockData.mockCaseAndTrails(params)
      caseThree = await mockData.mockCaseAndTrails(params)
    });
      
    it('returns a 500', async () => {
      const newParams = {
        caseIds: [caseOneInvalid.id, caseTwo.id, caseThree.id],
      };

      const results = await chai
        .request(server.app)
        .post(`/cases/publish`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send(newParams);
        
      results.error.should.not.be.false;
      results.should.have.status(500);
    });
    
  });

  describe('delete a case', () => {

    before(async () => {
      await casesService.deleteAllRows()

      const caseParams = {
        organization_id: currentOrg.id,
        state: 'published'
      };
      currentCase = await mockData.mockCase(caseParams)
    });

    it('return a 200', async () => {
      const newParams = {
        caseId: currentCase.id,
      };
  
      const results = await chai
        .request(server.app)
        .delete(`/case`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send(newParams);
        
      results.should.have.status(200);
    });
  });

});