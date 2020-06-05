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
      notification_threshold_percent: 66,
      notification_threshold_count: 6,
      days_to_retain_records: 14,
      region_coordinates: {
        "ne": { "latitude": 20.312764055951195, "longitude": -70.45445121262883 },
        "sw": { "latitude": 17.766025040122642, "longitude": -75.49442923997258 },
      },
      api_endpoint_url: 'http://api.sample.com',
      reference_website_url: 'http://reference.sample.com',
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

    it('fetch the configuration using http', async () => {
      const results = await chai
        .request(server.app)
        .get(`/organization/configuration`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json');

      results.should.have.status(200);
      results.body.name.should.equal(currentOrg.name);
      results.body.notificationThresholdPercent.should.equal(currentOrg.notificationThresholdPercent);
      results.body.notificationThresholdCount.should.equal(currentOrg.notificationThresholdCount);
      results.body.daysToRetainRecords.should.equal(currentOrg.daysToRetainRecords);
      results.body.regionCoordinates.ne.latitude.should.equal(currentOrg.regionCoordinates.ne.latitude);
      results.body.regionCoordinates.ne.longitude.should.equal(currentOrg.regionCoordinates.ne.longitude);
      results.body.regionCoordinates.sw.latitude.should.equal(currentOrg.regionCoordinates.sw.latitude);
      results.body.regionCoordinates.sw.longitude.should.equal(currentOrg.regionCoordinates.sw.longitude);
      results.body.apiEndpointUrl.should.equal(currentOrg.apiEndpointUrl);
      results.body.referenceWebsiteUrl.should.equal(currentOrg.referenceWebsiteUrl);
      results.body.infoWebsiteUrl.should.equal(currentOrg.infoWebsiteUrl);
    });

    it('update the record', async () => {
      const newParams = {
        name: "Some Health Authority",
        notificationThresholdPercent: 66,
        notificationThresholdCount: 6,
        daysToRetainRecords: 14,
        regionCoordinates: {
          ne: { "latitude": 20.312764055951195, "longitude": -70.45445121262883},
          sw: { "latitude": 17.766025040122642, "longitude": -75.49442923997258}
        },
        apiEndpointUrl: "https://s3.aws.com/bucket_name/safepaths.json",
        referenceWebsiteUrl: "http://cdc.gov",
        infoWebsiteUrl: "http://cdc.gov",
        privacyPolicyUrl: "https://superprivate.com",
        completedOnboarding: true
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
      results.body.infoWebsiteUrl.should.equal(newParams.infoWebsiteUrl);
      results.body.referenceWebsiteUrl.should.equal(newParams.referenceWebsiteUrl);
      results.body.apiEndpointUrl.should.equal(newParams.apiEndpointUrl);
      results.body.notificationThresholdPercent.should.equal(newParams.notificationThresholdPercent);
      results.body.notificationThresholdCount.should.equal(newParams.notificationThresholdCount);
      results.body.daysToRetainRecords.should.equal(newParams.daysToRetainRecords);
      results.body.privacyPolicyUrl.should.equal(newParams.privacyPolicyUrl);
      results.body.completedOnboarding.should.equal(newParams.completedOnboarding);
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
      results.body.should.have.property('contactTracerId');
      results.body.should.have.property('state');
      results.body.should.have.property('updatedAt');
      results.body.should.have.property('expiresAt');
      results.body.state.should.equal('unpublished');
    });
  });
});
