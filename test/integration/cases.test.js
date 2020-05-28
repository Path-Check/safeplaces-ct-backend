process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

const { v4: uuidv4 } = require('uuid');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mockData = require('../lib/mockData');
const server = require('../../app');
const cases = require('../../db/models/cases');

const jwtSecret = require('../../config/jwtConfig');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);

let currentCase, currentOrg, token;

before(async () => {
  const orgParams = {
    id: uuidv4(),
    name: 'My Example Organization',
    info_website_url: 'http://sample.com',
  };
  currentOrg = await mockData.mockOrganization(orgParams);

  const newUserParams = {
    username: 'myAwesomeUser',
    password: 'myAwesomePassword',
    email: 'myAwesomeUser@yomanbob.com',
    organization_id: currentOrg.id,
  };
  await mockData.mockUser(newUserParams);

  let caseParams = {
    organization_id: currentOrg.id,
    state: 'unpublished',
  };
  currentCase = await mockData.mockCase(caseParams);

  token = jwt.sign(
    {
      sub: 'admin',
      iat: ~~(Date.now() / 1000),
      exp:
        ~~(Date.now() / 1000) + (parseInt(process.env.JWT_EXP) || 1 * 60 * 60), // Default expires in an hour
    },
    jwtSecret.secret,
  );
});

describe('Case ', () => {
  describe('POST /cases/publish', () => {
    it('finds the state just inserted using database', async () => {
      const results = await cases.findOne({ id: currentCase.id });
      results.id.should.equal(currentCase.id);
    });

    it('updates the state using HTTP', async () => {
      const results = await chai
        .request(server.app)
        .post(`/cases/publish?ids=${currentCase.id}`)
        .set('Authorization', token)
        .set('content-type', 'application/json');
      results.body.result[0].state.should.equal('published');
    });
  })
});