process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

const chai = require('chai');
const should = chai.should(); // eslint-disable-line
const chaiHttp = require('chai-http');

const jwt = require('jsonwebtoken');
const jwtSecret = require('../../config/jwtConfig');

const server = require('../../app');
const mockData = require('../lib/mockData');

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

    await mockData.mockAccessCode();
  });

  it('should fail for unauthorized clients', async () => {
    let result = await chai.request(server.app).post('/access-code').send();
    result.should.have.status(401);
  });

  it('should create a new access code', async () => {
    let result = await chai
      .request(server.app)
      .post('/access-code')
      .set('Authorization', `Bearer ${token}`)
      .send();
    result.should.have.status(201);

    let accessCode = result.body.accessCode;
    chai.should().exist(accessCode);
    accessCode.length.should.equal(6);
  });
});
