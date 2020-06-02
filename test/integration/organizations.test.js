process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

const { v4: uuidv4 } = require('uuid');
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const mockData = require('../lib/mockData');

const server = require('../../app');
const organizations = require('../../db/models/organizations');

const jwtSecret = require('../../config/jwtConfig');

chai.use(chaiHttp);

let currentOrg;
let token;

describe('Organization ', () => {

  before(async () => {
    await mockData.clearMockData()
    
    let orgParams = {
      id: uuidv4(),
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
  });

  describe('GET /organization by id', () => {
    it('find the record just inserted using database', async () => {
      const results = await organizations.fetchById(currentOrg.id);
      results.id.should.equal(currentOrg.id);
    });

    it('find the record using http', async () => {
      const results = await chai
        .request(server.app)
        .get(`/organization/${currentOrg.id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json');
      // console.log(results)
      results.body.id.should.equal(currentOrg.id);
    });

    it('update the record', async () => {
      const newParams = {
        name: 'My New Example Name',
      };

      const results = await chai
        .request(server.app)
        .put(`/organization/${currentOrg.id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send(newParams);

      results.body.name.should.equal(newParams.name);
    });
  });
});
