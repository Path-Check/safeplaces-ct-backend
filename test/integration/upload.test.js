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
const uploadService = require('../../db/models/upload');

chai.use(chaiHttp);

describe('POST /case/points', () => {

  let token, currentOrg, currentAccessCode;

  before(async () => {
    await mockData.clearMockData();

    const orgParams = {
      name: 'Test Organization',
      info_website_url: 'http://test.com',
    };

    currentOrg = await mockData.mockOrganization(orgParams);

    const userParams = {
      username: 'test',
      password: 'test',
      email: 'test@test.com',
      organization_id: currentOrg.id,
    };

    await mockData.mockUser(userParams);

    token = jwt.sign(
      {
        sub: userParams.username,
        iat: ~~(Date.now() / 1000),
        exp:
          ~~(Date.now() / 1000) + (parseInt(process.env.JWT_EXP) || 1 * 60 * 60), // Default expires in an hour
      },
      jwtSecret.secret,
    );

    currentAccessCode = await mockData.mockAccessCode();
  });

  it('should fail for unauthorized clients', async () => {
    let result = await chai
      .request(server.app)
      .post('/case/points')
      .send();
    result.should.have.status(401);
  });

  it('should fail for malformed requests', async () => {
    let result = await chai
      .request(server.app)
      .post('/case/points')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accessCode: "123456",
      });
    result.should.have.status(400);

    result = await chai
      .request(server.app)
      .post('/case/points')
      .set('Authorization', `Bearer ${token}`)
      .send({
        caseId: 1,
      });
    result.should.have.status(400);
  });

  it('should fail for invalid access codes', async () => {
    let result = await chai
      .request(server.app)
      .post('/case/points')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accessCode: "123456",
        caseId: 1,
      });
    result.should.have.status(403);
  });

  it('should fail when consent is not granted', async () => {
    let result = await chai
      .request(server.app)
      .post('/case/points')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accessCode: currentAccessCode.value,
        caseId: 1,
      });
    result.should.have.status(451);
  });

  it('should succeed when consent is granted', async () => {
    currentAccessCode.upload_consent = true;

    await mockData.mockUploadPoints(currentAccessCode, 0);

    let result = await chai
      .request(server.app)
      .post('/case/points')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accessCode: currentAccessCode.value,
        caseId: 1,
      });
    result.should.have.status(202);
  });

  it('should ingest and return points once uploaded', async () => {
    currentAccessCode.upload_consent = true;

    const currentCase = await mockData.mockCase({
      organization_id: currentOrg.id,
      state: 'unpublished',
    });

    let points = await mockData.mockUploadPoints(currentAccessCode, 5);

    let result = await chai
      .request(server.app)
      .post('/case/points')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accessCode: currentAccessCode.value,
        caseId: currentCase.caseId,
      });
      
    result.should.have.status(200);

    chai.should().exist(result.body.concernPoints);
    result.body.concernPoints.length.should.equal(points.length);

    points = await uploadService.fetchPoints(currentAccessCode);
    points.length.should.equal(0);
  });
});
