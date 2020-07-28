process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);

const app = require('../../app');
const server = app.getTestingServer();

const mockData = require('../lib/mockData');
const mockAuth = require('../lib/mockAuth');

describe('User management', () => {
  let ctToken = null;
  let adminToken = null;
  let saToken = null;
  let currentOrg = null;

  before(async () => {
    let orgParams = {
      name: 'My Example Organization',
      info_website_url: 'http://sample.com',
      notification_threshold_percent: 66,
      notification_threshold_timeframe: 30,
      days_to_retain_records: 14,
      region_coordinates: {
        ne: { latitude: 20.312764055951195, longitude: -70.45445121262883 },
        sw: { latitude: 17.766025040122642, longitude: -75.49442923997258 },
      },
      api_endpoint_url: 'http://api.sample.com',
      reference_website_url: 'http://reference.sample.com',
      privacy_policy_url: 'http://privacy.reference.sample.com',
      completed_onboarding: true,
    };
    currentOrg = await mockData.mockOrganization(orgParams);

    let newUserParams = {
      username: 'myAwesomeUser',
      organization_id: currentOrg.id,
    };
    const user = await mockData.mockUser(newUserParams);
    ctToken = mockAuth.getAccessToken(user.idm_id, 'contact_tracer');
    adminToken = mockAuth.getAccessToken(user.idm_id, 'admin');
    saToken = mockAuth.getAccessToken(user.idm_id, 'super_admin');
  });

  it('rejects contact tracers', async () => {
    const results = await chai
      .request(server)
      .get('/auth/users/reflect')
      .set('Cookie', `access_token=${ctToken}`)
      .set('X-Requested-With', 'XMLHttpRequest')
      .set('content-type', 'application/json');

    expect(results.statusCode).eq(403);
    expect(results.text).eq('Forbidden');
  });

  it('rejects admins', async () => {
    const results = await chai
      .request(server)
      .get('/auth/users/reflect')
      .set('Cookie', `access_token=${adminToken}`)
      .set('X-Requested-With', 'XMLHttpRequest')
      .set('content-type', 'application/json');

    expect(results.statusCode).eq(403);
    expect(results.text).eq('Forbidden');
  });

  it('allows super admins', async () => {
    const results = await chai
      .request(server)
      .get('/auth/users/reflect')
      .set('Cookie', `access_token=${saToken}`)
      .set('X-Requested-With', 'XMLHttpRequest')
      .set('content-type', 'application/json');

    expect(results.statusCode).eq(204);
  });
});
