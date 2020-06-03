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

chai.use(chaiHttp);

let currentOrg, currentCase, token;

describe('Point', () => {

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

  describe('update a point', () => {

    before(async () => {
      await casesService.deleteAllRows()
      await pointsService.deleteAllRows()
  
      let params = {
        organization_id: currentOrg.id,
        number_of_trails: 10,
        seconds_apart: 1800,
        state: 'staging'
      };
  
      currentCase = await mockData.mockCaseAndTrails(_.extend(params, { state: 'unpublished' }))
    });

    it('return a 200', async () => {
      const testPoint = currentCase.points[0];

      const newParams = {
        pointId: testPoint.id,
        longitude: 12.91328448,
        latitude: 39.24060321,
        time: "2020-05-21T18:25:43.511Z"
      };
  
      const results = await chai
        .request(server.app)
        .put(`/point`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send(newParams);

      results.error.should.be.false;
      results.should.have.status(200);
      results.body.should.be.a('object');
      results.body.should.have.property('point');
      results.body.point.should.be.a('object');
      results.body.point.should.have.property('pointId');
      results.body.point.should.have.property('longitude');
      results.body.point.should.have.property('latitude');
      results.body.point.should.have.property('time');
      results.body.point.pointId.should.equal(testPoint.id);
      results.body.point.longitude.should.equal(newParams.longitude);

    });
  });

  describe('delete a case', () => {

    before(async () => {
      await casesService.deleteAllRows()
      await pointsService.deleteAllRows()
  
      let params = {
        organization_id: currentOrg.id,
        number_of_trails: 10,
        seconds_apart: 1800,
        state: 'staging'
      };
  
      currentCase = await mockData.mockCaseAndTrails(_.extend(params, { state: 'unpublished' }))
    });

    it('return a 200', async () => {
      const testPoint = currentCase.points[0];
      
      const newParams = {
        pointId: testPoint.id,
      };
  
      const results = await chai
        .request(server.app)
        .delete(`/point`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send(newParams);
        
      results.should.have.status(200);
    });
  });

});