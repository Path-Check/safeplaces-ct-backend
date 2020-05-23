process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

const { v4: uuidv4 } = require('uuid');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const mockData = require('../lib/mockData');
const organizations = require('../../db/models/organizations');

const jwtSecret = require('../../config/jwtConfig');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);

let currentUser;
let currentOrg;
let token;

before(async () => {
  let orgParams = {
    id: uuidv4(),
    authority_name: 'My Example Organization',
    info_website: 'http://sample.com',
  };
  currentOrg = await mockData.mockOrganization(orgParams);

  let newUserParams = {
    username: 'myAwesomeUser',
    password: 'myAwesomePassword',
    email: 'myAwesomeUser@yomanbob.com',
    organization: currentOrg.id,
  };
  currentUser = await mockData.mockUser(newUserParams);

  token = jwt.sign(
    {
      sub: currentUser.username,
      iat: ~~(Date.now() / 1000),
      exp:
        ~~(Date.now() / 1000) + (parseInt(process.env.JWT_EXP) || 1 * 60 * 60), // Default expires in an hour
    },
    jwtSecret.secret,
  );
});

describe('Organization ', () => {
  describe('GET /organization when DB is empty', () => {
    it('find the record just inserted using database', async () => {
      const results = await organizations.findOne({ id: currentOrg.id });
      results.id.should.equal(currentOrg.id);
    });

    it('find the record using http', async () => {
      const results = await chai
        .request(server.app)
        .get(`/organization/${currentOrg.id}`)
        .set('Authorization', `${token}`)
        .set('content-type', 'application/json');
      // console.log(results)
      results.body.id.should.equal(currentOrg.id);
    });

    it('update the record', async () => {
      const newParams = {
        authority_name: 'My New Example Name',
      };

      const results = await chai
        .request(server.app)
        .put(`/organization/${currentOrg.id}`)
        .set('Authorization', `${token}`)
        .set('content-type', 'application/json')
        .send(newParams);

      results.body.authority_name.should.equal(newParams.authority_name);
    });
  });
});
