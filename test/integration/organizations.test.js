process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

const chai = require('chai');
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
        .set('Authorization', `${token}`)
        .set('content-type', 'application/json');
        
      results.should.have.status(200);
      results.body.name.should.equal(currentOrg.name);
    });

    it('update the record', async () => {
      const newParams = {
        name: 'My New Example Name',
      };

      const results = await chai
        .request(server.app)
        .put(`/organization/configuration`)
        .set('Authorization', `${token}`)
        .set('content-type', 'application/json')
        .send(newParams);

      results.should.have.status(200);
      results.body.should.be.a('object');
      results.body.name.should.equal(newParams.name);
      results.body.info_website_url.should.equal(currentOrg.info_website_url);
      results.body.reference_website_url.should.equal(currentOrg.reference_website_url);
      results.body.api_endpoint_url.should.equal(currentOrg.api_endpoint_url);
      results.body.notification_threshold_percent.should.equal(currentOrg.notification_threshold_percent);
      results.body.notification_threshold_count.should.equal(currentOrg.notification_threshold_count);
      results.body.days_to_retain_records.should.equal(currentOrg.days_to_retain_records);
    });

    it('fetch the organizations cases', async () => {
      const results = await chai
        .request(server.app)
        .get(`/organization/cases`)
        .set('Authorization', `${token}`)
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

    // it('create the record', async () => {
    //   const newParams = {
    //     name: 'My New Example Name',
    //   };

    //   const results = await chai
    //     .request(server.app)
    //     .put(`/organization/configuration`)
    //     .set('Authorization', `${token}`)
    //     .set('content-type', 'application/json')
    //     .send(newParams);

    //   results.should.have.status(200);
    //   results.body.should.be.a('object');
    //   results.body.name.should.equal(newParams.name);
    //   results.body.info_website_url.should.equal(currentOrg.info_website_url);
    //   results.body.reference_website_url.should.equal(currentOrg.reference_website_url);
    //   results.body.api_endpoint_url.should.equal(currentOrg.api_endpoint_url);
    //   results.body.notification_threshold_percent.should.equal(currentOrg.notification_threshold_percent);
    //   results.body.notification_threshold_count.should.equal(currentOrg.notification_threshold_count);
    //   results.body.days_to_retain_records.should.equal(currentOrg.days_to_retain_records);
    // });

    it('delete the record', async () => {
      const newParams = {
        case_id: caseToDelete.id,
      };

      const results = await chai
        .request(server.app)
        .delete(`/organization/case`)
        .set('Authorization', `${token}`)
        .set('content-type', 'application/json')
        .send(newParams);
        
      results.should.have.status(200);
    });
  });
});