process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const mockData = require('../lib/mockData');

const server = require('../../app');
// const organizations = require('../../db/models/cases');

const jwtSecret = require('../../config/jwtConfig');

chai.use(chaiHttp);

let currentOrg, caseToDelete, caseToTestStaging, token;

describe.only('Case ', () => {

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
  
    token = jwt.sign(
      {
        sub: newUserParams.username,
        iat: ~~(Date.now() / 1000),
        exp:
          ~~(Date.now() / 1000) + (parseInt(process.env.JWT_EXP) || 1 * 60 * 60), // Default expires in an hour
      },
      jwtSecret.secret,
    );

    const caseParams = {
      organization_id: currentOrg.id,
      state: 'unpublished'
    };

    caseToDelete = await mockData.mockCase(caseParams)
    caseToTestStaging = await mockData.mockCase(caseParams)
  });

  let caseId = 123123;

  it('fetch case points', async () => {
    const results = await chai
      .request(server.app)
      .get(`/case/points?caseId=${caseId}`)
      .set('Authorization', `${token}`)
      .set('content-type', 'application/json');
      
    results.should.have.status(200);
  });

  it('create case with points', async () => {
    const newParams = {
      caseId: caseToTestStaging.id,
      point: {
        longitude: 14.91328448,
        latitude: 41.24060321,
        time: "2020-05-30T18:25:43.511Z"
      }
    };

    const results = await chai
      .request(server.app)
      .post(`/case/point`)
      .set('Authorization', `${token}`)
      .set('content-type', 'application/json')
      .send(newParams);

      
    results.error.should.be.false;
    results.should.have.status(200);
  });

  it('add user consent to publish', async () => {
    const newParams = {
      caseId: caseToTestStaging.id,
    };

    const results = await chai
      .request(server.app)
      .post(`/case/consent-to-publishing`)
      .set('Authorization', `${token}`)
      .set('content-type', 'application/json')
      .send(newParams);
      
    results.should.have.status(200);
  });

  it('move case to staging', async () => {
    const newParams = {
      caseId: caseToTestStaging.id,
    };

    const results = await chai
      .request(server.app)
      .post(`/case/stage`)
      .set('Authorization', `${token}`)
      .set('content-type', 'application/json')
      .send(newParams);
      
    results.should.have.status(200);
  });

  it('publish case', async () => {
    const newParams = {
      caseId: caseToTestStaging.id,
    };

    const results = await chai
      .request(server.app)
      .post(`/case/publish`)
      .set('Authorization', `${token}`)
      .set('content-type', 'application/json')
      .send(newParams);
      
    results.should.have.status(200);
  });

  it('delete case', async () => {
    const newParams = {
      caseId: caseToDelete.id,
    };

    const results = await chai
      .request(server.app)
      .delete(`/case`)
      .set('Authorization', `${token}`)
      .set('content-type', 'application/json')
      .send(newParams);
      
    results.should.have.status(200);
  });
});