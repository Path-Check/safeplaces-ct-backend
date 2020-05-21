process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

const { v4: uuidv4 } = require('uuid');
const chai = require('chai');
const chaiHttp = require('chai-http');
// const jwtSecret = require('../config/jwtConfig');
// const jwt = require('jsonwebtoken');
const server = require('../app');
const organizations = require('../db/models/organizations');

// const ORGANISATION_ID = 'a88309c2-26cd-4d2b-8923-af0779e423a3';
// const USER_ID = 'a88309ca-26cd-4d2b-8923-af0779e423a3';

// const USERNAME = 'admin';
// const ADMIN_JWT_TOKEN = jwt.sign(
//   {
//     sub: USERNAME,
//     iat: ~~(Date.now() / 1000),
//     exp: ~~(Date.now() / 1000) + (parseInt(process.env.JWT_EXP) || (1 * 60 * 60)) // Default expires in an hour
//   },
//   jwtSecret.secret
// );

// const ADMIN_JWT_TOKEN_EXPIRED = jwt.sign(
//   {
//     sub: USERNAME,
//     iat: ~~(Date.now() / 1000),
//     exp: ~~(Date.now() / 1000) - 1
//   },
//   jwtSecret.secret
// );

chai.use(chaiHttp);

let currentOrg;

describe.only('Organization ', () => {

  before(async () => {
    currentOrg = {
      id: uuidv4(),
      authority_name: 'My Example Name',
      info_website: 'http://sample.com'
    };
    await organizations.deleteAllRows();
    await organizations.create(currentOrg);
  });

  describe('GET /organization when DB is empty', () => {

    it('find the record just inserted using database', async () => {
      const results = await organizations.findOne({ id: currentOrg.id });
      results.id.should.equal(currentOrg.id);
    });

    it('find the record using http', async () => {
        const results = await chai.request(server.app)
          .get(`/organization/${currentOrg.id}`)
          // .set('Authorization', `${ADMIN_JWT_TOKEN}`)
          .set('content-type', 'application/json');

        results.body.id.should.equal(currentOrg.id);
    });

    it('update the record', async () => {
        const newParams = {
          'authority_name': 'My New Example Name'
        };

        const results = await chai.request(server.app)
          .put(`/organization/${currentOrg.id}`)
          // .set('Authorization', `${ADMIN_JWT_TOKEN}`)
          .set('content-type', 'application/json')
          .send(newParams);

        results.body.authority_name.should.equal(newParams.authority_name);
    });
  });

});
