process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

const chai = require('chai');
const should = chai.should(); // eslint-disable-line
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const mockData = require('../lib/mockData');

const server = require('../../app');
const organizations = require('../../db/models/organizations');

const jwtSecret = require('../../config/jwtConfig');

chai.use(chaiHttp);

let currentOrg, caseToDelete, token;

describe('Organization ', () => {

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

    const caseParams = {
      organization_id: currentOrg.id,
      state: 'unpublished'
    };

    await mockData.mockCase(caseParams)
    await mockData.mockCase(caseParams)
    caseToDelete = await mockData.mockCase(caseParams)

    token = jwt.sign(
      {
        sub: newUserParams.username,
        iat: ~~(Date.now() / 1000),
        exp:
          ~~(Date.now() / 1000) + (parseInt(process.env.JWT_EXP) || 1 * 60 * 60), // Default expires in an hour
      },
      jwtSecret.secret,
    );
  });

  describe('GET /organization by user', () => {
    it('find the record just inserted using database', async () => {
      const results = await organizations.fetchById(currentOrg.id);
      results.id.should.equal(currentOrg.id);
    });

    it('fetch the record using http', async () => {
      const results = await chai
        .request(server.app)
        .get(`/organization`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json');

      results.should.have.status(200);
      results.body.name.should.equal(currentOrg.name);
      results.body.id.should.equal(currentOrg.id);
      results.body.completedOnboarding.should.equal(currentOrg.completedOnboarding);
    });

    it('update the record', async () => {
      const newParams = {
        name: 'My New Example Name',
      };

      const results = await chai
        .request(server.app)
        .put(`/organization/configuration`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send(newParams);

      results.should.have.status(200);
      results.body.should.be.a('object');
      results.body.name.should.equal(newParams.name);
      results.body.infoWebsiteUrl.should.equal(currentOrg.infoWebsiteUrl);
      results.body.referenceWebsiteUrl.should.equal(currentOrg.referenceWebsiteUrl);
      results.body.apiEndpointUrl.should.equal(currentOrg.apiEndpointUrl);
      results.body.notificationThresholdPercent.should.equal(currentOrg.notificationThresholdPercent);
      results.body.notificationThresholdCount.should.equal(currentOrg.notificationThresholdCount);
      results.body.daysToRetainRecords.should.equal(currentOrg.daysToRetainRecords);
      results.body.privacyPolicyUrl.should.equal(currentOrg.privacyPolicyUrl);
      results.body.completedOnboarding.should.equal(false);
    });

    it('fetch the organizations cases', async () => {
      const results = await chai
        .request(server.app)
        .get(`/organization/cases`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json');

      results.should.have.status(200);
      results.body.should.be.a('object');
      results.body.should.have.property('cases');
      results.body.cases.should.be.a('array');
      results.body.cases.length.should.equal(3);

      const firstChunk = results.body.cases.shift()
      firstChunk.should.have.property('id');
      firstChunk.id.should.be.a('number')
      firstChunk.should.have.property('state');
      firstChunk.state.should.be.a('string')
      firstChunk.should.have.property('updated_at');
      firstChunk.updated_at.should.be.a('string')
    });

    it('delete the record', async () => {
      const newParams = {
        case_id: caseToDelete.caseId,
      };

      const results = await chai
        .request(server.app)
        .delete(`/organization/case`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send(newParams);

      results.should.have.status(200);
    });
  });

  describe('create a case', () => {

    it('returns a 200', async () => {
      const results = await chai
        .request(server.app)
        .post(`/organization/case`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send();

      results.error.should.be.false;
      results.should.have.status(200);
      results.body.should.be.a('object');
      results.body.should.have.property('caseId');
      results.body.should.have.property('state');
      results.body.should.have.property('updatedAt');
      results.body.should.have.property('expiresAt');
      results.body.state.should.equal('unpublished');

    });
  });
});
