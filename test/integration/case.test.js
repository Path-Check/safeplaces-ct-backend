process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

const { caseService, pointService } = require('../../app/lib/db');
const _ = require('lodash');
const moment = require('moment');
const chai = require('chai');
const should = chai.should(); // eslint-disable-line
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const mockData = require('../lib/mockData');

const server = require('../../app');

const jwtSecret = require('../../config/jwtConfig');

const type = process.env.PUBLISH_STORAGE_TYPE || 'local';

chai.use(chaiHttp);

let currentOrg, currentCase, token;

describe('Case', () => {
  before(async () => {
    await mockData.clearMockData();

    let orgParams = {
      name: 'My Example Organization',
      info_website_url: 'http://sample.com',
    };
    currentOrg = await mockData.mockOrganization(orgParams);

    let newUserParams = {
      username: 'myAwesomeUser',
      organization_id: currentOrg.id,
    };
    const user = await mockData.mockUser(newUserParams);

    token = jwt.sign(
      {
        sub: user.idm_id,
        iat: ~~(Date.now() / 1000),
        exp:
          ~~(Date.now() / 1000) +
          (parseInt(process.env.JWT_EXP) || 1 * 60 * 60), // Default expires in an hour
      },
      jwtSecret.secret,
    );
  });

  describe('fetch case points', () => {
    before(async () => {
      await caseService.deleteAllRows();

      const caseParams = {
        organization_id: currentOrg.id,
        state: 'published',
      };
      currentCase = await mockData.mockCase(caseParams);

      // Add Trails
      let trailsParams = {
        caseId: currentCase.caseId,
      };
      await mockData.mockTrails(10, 1800, trailsParams); // Generate 10 trails 30 min apart
    });

    it('and return multiple case points', async () => {
      const results = await chai
        .request(server.app)
        .post(`/case/points`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send({ caseId: currentCase.caseId });

      results.error.should.be.false;
      results.should.have.status(200);
      results.body.should.be.a('object');
      results.body.should.have.property('concernPoints');
      results.body.concernPoints.should.be.a('array');
      results.body.concernPoints.length.should.equal(10);

      const firstChunk = results.body.concernPoints.shift();
      firstChunk.should.have.property('pointId');
      firstChunk.should.have.property('longitude');
      firstChunk.should.have.property('latitude');
      firstChunk.should.have.property('time');
      firstChunk.should.have.property('nickname');
    });
  });

  describe('fetch points for multiple cases', () => {
    let caseOne, caseTwo, caseThree;

    before(async () => {
      await caseService.deleteAllRows();

      const caseParams = {
        organization_id: currentOrg.id,
        state: 'staging',
      };
      caseOne = await mockData.mockCase(caseParams);
      caseTwo = await mockData.mockCase(caseParams);
      caseThree = await mockData.mockCase(caseParams);

      await mockData.mockTrails(10, 1800, { caseId: caseOne.caseId }); // Generate 10 trails 30 min apart
      await mockData.mockTrails(10, 1800, { caseId: caseTwo.caseId }); // Generate 10 trails 30 min apart
      await mockData.mockTrails(10, 1800, { caseId: caseThree.caseId }); // Generate 10 trails 30 min apart
    });

    it('and return points for all cases', async () => {
      const results = await chai
        .request(server.app)
        .post(`/cases/points`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send({ caseIds: [caseOne.caseId, caseTwo.caseId, caseThree.caseId] });

      results.error.should.be.false;
      results.should.have.status(200);
      results.body.should.be.a('object');
      results.body.should.have.property('concernPoints');
      results.body.concernPoints.should.be.a('array');
      results.body.concernPoints.length.should.equal(30);

      const firstChunk = results.body.concernPoints.shift();
      firstChunk.should.have.property('pointId');
      firstChunk.should.have.property('longitude');
      firstChunk.should.have.property('latitude');
      firstChunk.should.have.property('time');
      firstChunk.should.have.property('nickname');
    });

    it('and returns no points if no caseIds are passed', async () => {
      const results = await chai
        .request(server.app)
        .post(`/cases/points`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send({ caseIds: [] });

      results.error.should.be.false;
      results.should.have.status(200);
      results.body.should.be.a('object');
      results.body.should.have.property('concernPoints');
      results.body.concernPoints.should.be.a('array');
      results.body.concernPoints.length.should.equal(0);
    });

    it('and fails if caseIds are not passed', async () => {
      const results = await chai
        .request(server.app)
        .post(`/cases/points`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send();

      results.should.have.status(400);
    });
  });

  describe('add a single point on a case', () => {
    before(async () => {
      await caseService.deleteAllRows();

      const caseParams = {
        organization_id: currentOrg.id,
        state: 'published',
      };
      currentCase = await mockData.mockCase(caseParams);
    });

    it('and return the newly created point', async () => {
      const newParams = {
        caseId: currentCase.caseId,
        point: {
          longitude: 14.91328448,
          latitude: 41.24060321,
          time: '2020-05-01T18:25:43.511Z',
          duration: 5,
          nickname: 'home',
        },
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
      results.body.concernPoint.longitude.should.equal(
        newParams.point.longitude,
      );
      results.body.concernPoint.latitude.should.equal(newParams.point.latitude);
      results.body.concernPoint.time.should.equal(newParams.point.time);
      results.body.concernPoint.nickname.should.equal(newParams.point.nickname);
    });
  });

  describe('update a point on a case', () => {
    before(async () => {
      await caseService.deleteAllRows();
      await pointService.deleteAllRows();

      let params = {
        organization_id: currentOrg.id,
        number_of_trails: 10,
        seconds_apart: 1800,
        state: 'staging',
      };

      currentCase = await mockData.mockCaseAndTrails(
        _.extend(params, { state: 'unpublished' }),
      );
    });

    it('return a 200', async () => {
      const testPoint = currentCase.points[0];

      const newParams = {
        pointId: testPoint.id,
        longitude: 12.91328448,
        latitude: 39.24060321,
        time: '2020-05-21T18:25:43.511Z',
        duration: 5,
        nickname: 'grocery store',
      };

      const results = await chai
        .request(server.app)
        .put(`/case/point`)
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
      results.body.concernPoint.should.have.property('duration');
      results.body.concernPoint.pointId.should.equal(testPoint.id);
      results.body.concernPoint.longitude.should.equal(newParams.longitude);
      results.body.concernPoint.nickname.should.equal(newParams.nickname);
    });
  });

  describe('update multiple points on a case', () => {
    before(async () => {
      await caseService.deleteAllRows();
      await pointService.deleteAllRows();

      let params = {
        organization_id: currentOrg.id,
        number_of_trails: 2,
        seconds_apart: 1800,
        state: 'staging',
        nickname: 'home',
      };

      currentCase = await mockData.mockCaseAndTrails(
        _.extend(params, { state: 'unpublished' }),
      );
    });

    it('return a 200', async () => {
      const point1 = currentCase.points[0];
      const point2 = currentCase.points[1];

      const newParams = {
        pointIds: [point1.id, point2.id],
        nickname: 'grocery store',
      };

      const results = await chai
        .request(server.app)
        .put(`/case/points`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send(newParams);

      results.error.should.be.false;
      results.should.have.status(200);

      const firstChunk = results.body.concernPoints[0];
      firstChunk.nickname.should.equal(newParams.nickname);

      const secondChunk = results.body.concernPoints[1];
      secondChunk.nickname.should.equal(newParams.nickname);
    });
  });

  describe('delete a point on a case', () => {
    before(async () => {
      await caseService.deleteAllRows();
      await pointService.deleteAllRows();

      let params = {
        organization_id: currentOrg.id,
        number_of_trails: 10,
        seconds_apart: 1800,
        state: 'staging',
      };

      currentCase = await mockData.mockCaseAndTrails(
        _.extend(params, { state: 'unpublished' }),
      );
    });

    it('returns a 200', async () => {
      const testPoint = currentCase.points[0];

      const newParams = {
        pointId: testPoint.id,
      };

      const results = await chai
        .request(server.app)
        .post(`/case/point/delete`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send(newParams);

      results.should.have.status(200);
    });
  });

  describe('delete points on a case', () => {
    before(async () => {
      await caseService.deleteAllRows();

      const caseParams = {
        organization_id: currentOrg.id,
        state: 'published',
      };
      currentCase = await mockData.mockCase(caseParams);

      // Add Trails
      let trailsParams = {
        caseId: currentCase.caseId,
      };
      await mockData.mockTrails(10, 1800, trailsParams); // Generate 10 trails 30 min apart
    });

    it('fails when request is malformed', async () => {
      let results = await chai
        .request(server.app)
        .post(`/case/points/delete`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send();
      results.error.should.not.be.false;
      results.should.have.status(400);

      results = await chai
        .request(server.app)
        .post(`/case/points/delete`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send({ pointIds: 'invalid' });
      results.error.should.not.be.false;
      results.should.have.status(400);
    });

    it('deletes points', async () => {
      let points = await caseService.fetchCasePoints(currentCase.caseId);
      const initialLength = points.length;
      initialLength.should.be.greaterThan(3);

      const deletedPoints = _.sampleSize(points, 3);

      const results = await chai
        .request(server.app)
        .post(`/case/points/delete`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send({ pointIds: _.map(deletedPoints, point => point.id) });

      results.error.should.be.false;
      results.should.have.status(200);

      points = await caseService.fetchCasePoints(currentCase.caseId);
      points.length.should.equal(initialLength - deletedPoints.length);
    });
  });

  describe('consent to publishing case', () => {
    before(async () => {
      await caseService.deleteAllRows();

      const caseParams = {
        organization_id: currentOrg.id,
        state: 'unpublished',
      };
      currentCase = await mockData.mockCase(caseParams);
    });

    it('returns the updated case', async () => {
      const requestParams = {
        caseId: currentCase.caseId,
      };

      const result = await chai
        .request(server.app)
        .post(`/case/consent-to-publishing`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send(requestParams);

      result.error.should.be.false;
      result.should.have.status(200);
      result.body.should.be.a('object');
      result.body.should.have.property('case');
      result.body.case.should.be.a('object');
      result.body.case.should.have.property('caseId');
      result.body.case.should.have.property('externalId');
      result.body.case.should.have.property('contactTracerId');
      result.body.case.should.have.property('state');
      result.body.case.should.have.property('updatedAt');
      result.body.case.should.have.property('expiresAt');
      result.body.case.caseId.should.equal(currentCase.caseId);
    });
  });

  describe('move a case to staging', () => {
    before(async () => {
      await caseService.deleteAllRows();

      const caseParams = {
        organization_id: currentOrg.id,
        state: 'published',
      };
      currentCase = await mockData.mockCase(caseParams);
    });

    it('return the updated case', async () => {
      const newParams = {
        caseId: currentCase.caseId,
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
      results.body.case.should.have.property('contactTracerId');
      results.body.case.should.have.property('state');
      results.body.case.should.have.property('stagedAt');
      results.body.case.should.have.property('updatedAt');
      results.body.case.should.have.property('expiresAt');
      results.body.case.caseId.should.equal(currentCase.caseId);
      results.body.case.state.should.equal('staging');
    });
  });

  describe('publish a case(s)', () => {
    let caseOne, caseTwo, caseThree;

    beforeEach(async () => {
      await caseService.deleteAllRows();
      await pointService.deleteAllRows();

      let params = {
        organization_id: currentOrg.id,
        number_of_trails: 10,
        seconds_apart: 1800,
        state: 'staging',
      };

      caseOne = await mockData.mockCaseAndTrails(params);
      caseTwo = await mockData.mockCaseAndTrails(params);
      caseThree = await mockData.mockCaseAndTrails(params);
    });

    it(`returns multiple published cases (${type})`, async () => {
      const newParams = {
        caseIds: [caseOne.caseId, caseTwo.caseId, caseThree.caseId],
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
        c.should.have.property('externalId');
        c.should.have.property('contactTracerId');
        c.state.should.be.equal('published');
        c.should.have.property('state');
        c.should.have.property('updatedAt');
        c.should.have.property('expiresAt');
      });
    });

    it('returns test json to validate contents of file', async () => {
      const newParams = {
        caseIds: [caseOne.caseId, caseTwo.caseId, caseThree.caseId],
      };

      const results = await chai
        .request(server.app)
        .post(`/cases/publish?type=json`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send(newParams);
      let pageEndpoint = `${currentOrg.apiEndpointUrl}[PAGE].json`;

      results.error.should.be.false;
      results.should.have.status(200);
      results.body.should.be.a('object');

      results.body.files.should.be.a('array');

      const firstChunk = results.body.files.shift();
      firstChunk.should.be.a('object');

      firstChunk.should.have.property('name');
      firstChunk.should.have.property('notification_threshold_percent');
      firstChunk.should.have.property('notification_threshold_timeframe');
      firstChunk.should.have.property('concern_point_hashes');
      firstChunk.should.have.property('info_website_url');
      firstChunk.should.have.property('publish_date_utc');
      if (process.env.HASHING_TEST) {
        firstChunk.should.have.property('points_for_test');
      }
      firstChunk.name.should.equal(currentOrg.name);
      firstChunk.info_website_url.should.equal(currentOrg.infoWebsiteUrl);

      firstChunk.concern_point_hashes.should.be.a('array');
      firstChunk.concern_point_hashes.length.should.equal(30);
      firstChunk.concern_point_hashes.forEach(point => {
        point.should.be.a('string');
      });

      const firstCursor = results.body.cursor.pages.shift();
      firstCursor.should.be.a('object');
      firstCursor.should.have.property('id');
      firstCursor.id.should.be.a('string');
      firstCursor.should.have.property('startTimestamp');
      firstCursor.startTimestamp.should.be.a('number');
      firstCursor.should.have.property('endTimestamp');
      firstCursor.endTimestamp.should.be.a('number');
      firstCursor.should.have.property('filename');
      firstCursor.filename.should.be.a('string');
      firstCursor.filename.should.equal(
        pageEndpoint.replace(
          '[PAGE]',
          `${firstCursor.startTimestamp}_${firstCursor.endTimestamp}`,
        ),
      );
    });
  });

  describe('publishes cases that generate multiple files', () => {
    let newCase;

    beforeEach(async () => {
      await caseService.deleteAllRows();
      await pointService.deleteAllRows();

      let params = {
        organization_id: currentOrg.id,
        number_of_trails: 10,
        seconds_apart: 1800,
        state: 'staging',
      };

      // Create two cases that have been published.
      await mockData.mockCaseAndTrails(
        _.extend(params, {
          publishedOn: new Date().getTime() - 86400 * 5 * 1000,
        }),
      ); // Published 5 days ago
      await mockData.mockCaseAndTrails(
        _.extend(params, {
          publishedOn: new Date().getTime() - 86400 * 2 * 1000,
        }),
      ); // Published 2 days ago

      // Create third case that will be published on call.
      newCase = await mockData.mockCaseAndTrails(
        _.extend(params, { publishedOn: null }),
      );
    });

    it('returns test json to validate contents of file', async () => {
      const newParams = {
        caseIds: [newCase.caseId],
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

      results.body.cursor.should.be.a('object');
      results.body.cursor.pages.should.be.a('array');
      results.body.cursor.pages.length.should.equal(3);
      results.body.files.should.be.a('array');
      results.body.files.length.should.equal(3);
    });
  });

  describe('honors expires at on previously published case', function () {
    this.timeout(5000);

    let caseTwo, caseThree;

    beforeEach(async () => {
      await caseService.deleteAllRows();
      await pointService.deleteAllRows();

      let params = {
        organization_id: currentOrg.id,
        number_of_trails: 10,
        seconds_apart: 1800,
      };

      let invalidDate = moment().startOf('day').subtract(60, 'days').format(); // Two months ago

      await mockData.mockCaseAndTrails(
        _.extend(params, { state: 'published', expires_at: invalidDate }),
      );
      caseTwo = await mockData.mockCaseAndTrails(
        _.extend(params, { state: 'staging', expires_at: null }),
      );
      caseThree = await mockData.mockCaseAndTrails(
        _.extend(params, { state: 'staging', expires_at: null }),
      );
    });

    it(`returns only 2 of the 3 cases entered (${type})`, async () => {
      const newParams = {
        caseIds: [caseTwo.caseId, caseThree.caseId],
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
        caseIds: [caseTwo.caseId, caseThree.caseId],
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
    let caseOneInvalid, caseTwo, caseThree;

    beforeEach(async () => {
      await caseService.deleteAllRows();
      await pointService.deleteAllRows();

      let params = {
        organization_id: currentOrg.id,
        number_of_trails: 10,
        seconds_apart: 1800,
        state: 'staging',
      };

      caseOneInvalid = await mockData.mockCaseAndTrails(
        _.extend(params, { state: 'unpublished' }),
      );
      caseTwo = await mockData.mockCaseAndTrails(params);
      caseThree = await mockData.mockCaseAndTrails(params);
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
      await caseService.deleteAllRows();

      const caseParams = {
        organization_id: currentOrg.id,
        state: 'published',
      };
      currentCase = await mockData.mockCase(caseParams);
    });

    it('return a 200', async () => {
      const newParams = {
        caseId: currentCase.caseId,
      };

      const results = await chai
        .request(server.app)
        .post(`/case/delete`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send(newParams);

      results.should.have.status(200);
    });
  });

  describe('update a case', () => {
    it('return a 200', async () => {
      const caseParams = {
        organization_id: currentOrg.id,
        external_id: 'sdfasdfasdfasdf',
        state: 'unpublished',
      };

      let currentCase = await mockData.mockCase(caseParams);

      let updateParams = {
        caseId: currentCase.caseId,
        externalId: 'an_external_id',
      };

      const results = await chai
        .request(server.app)
        .put(`/case`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send(updateParams);

      results.should.have.status(200);
      results.body.should.be.a('object');
      results.body.case.externalId.should.eq('an_external_id');
    });
  });

  describe('purge cases outside 30 day retention period for organization', () => {
    before(async () => {
      await caseService.deleteAllRows();
      await pointService.deleteAllRows();

      // Add Case & Trails
      let expires_at = new Date().getTime() - 86400 * 10 * 1000;
      const caseOne = await mockData.mockCase({
        organization_id: currentOrg.id,
        state: 'published',
        expires_at: new Date(expires_at),
      });
      let trailsParams = {
        caseId: caseOne.caseId,
        startAt: new Date().getTime() - 86400 * 40 * 1000, // 40 days ago,
      };
      await mockData.mockTrails(10, 1800, trailsParams); // Create

      // Add Case & Trails
      expires_at = new Date().getTime() + 86400 * 20 * 1000;
      const caseTwo = await mockData.mockCase({
        organization_id: currentOrg.id,
        state: 'published',
      });
      trailsParams = {
        caseId: caseTwo.caseId,
        startAt: new Date().getTime() - 86400 * 20 * 1000, // 40 days ago
      };
      await mockData.mockTrails(10, 1800, trailsParams); // Create
    });
    it('return a 200', async () => {
      const results = await chai
        .request(server.app)
        .get(`/organization/cases`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json');

      results.should.have.status(200);
      results.body.should.be.a('object');
      results.body.cases.should.be.a('array');
      results.body.cases.length.should.equal(1);
    });
  });
});
