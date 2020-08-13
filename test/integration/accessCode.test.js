process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

const chai = require('chai');
const should = chai.should(); // eslint-disable-line
const chaiHttp = require('chai-http');

const app = require('../../app');
const server = app.getTestingServer();

const mockData = require('../lib/mockData');
const mockAuth = require('../lib/mockAuth');

chai.use(chaiHttp);

describe('POST /access-code', () => {
  let token;

  before(async () => {
    await mockData.clearMockData();

    const orgParams = {
      name: 'Test Organization',
      info_website_url: 'http://test.com',
    };

    const org = await mockData.mockOrganization(orgParams);

    const userParams = {
      username: 'test',
      organization_id: org.id,
    };

    const user = await mockData.mockUser(userParams);
    token = mockAuth.getAccessToken(user.idm_id, 'admin');

    await mockData.mockAccessCode();
  });

  it('should fail for unauthorized clients', async () => {
    let result = await chai
      .request(server)
      .post('/access-code')
      .set('X-Requested-With', 'XMLHttpRequest')
      .send();
    result.should.have.status(403);
  });

  it('should create a new access code', async () => {
    let result = await chai
      .request(server)
      .post('/access-code')
      .set('Cookie', `access_token=${token}`)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send();
    result.should.have.status(201);

    let accessCode = result.body.accessCode;
    chai.should().exist(accessCode);
    accessCode.length.should.equal(6);
  });
});
