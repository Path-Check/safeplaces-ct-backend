process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

const { v4: uuidv4 } = require('uuid');
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const jwtSecret = require('../../config/jwtConfig');
const server = require('../../app');
const trails = require('../../db/models/trails');

const mockData = require('../lib/mockData');

// const ORGANISATION_ID = 'a88309c2-26cd-4d2b-8923-af0779e423a3';
// const USER_ID = 'a88309ca-26cd-4d2b-8923-af0779e423a3';
// const USERNAME = 'admin';
// const ADMIN_JWT_TOKEN = jwt.sign(
//   {
//     sub: USERNAME,
//     iat: ~~(Date.now() / 1000),
//     exp: ~~(Date.now() / 1000) + (parseInt(process.env.JWT_EXP) || 1 * 60 * 60), // Default expires in an hour
//   },
//   jwtSecret.secret,
// );

// const ADMIN_JWT_TOKEN_EXPIRED = jwt.sign(
//   {
//     sub: USERNAME,
//     iat: ~~(Date.now() / 1000),
//     exp: ~~(Date.now() / 1000) - 1,
//   },
//   jwtSecret.secret,
// );

chai.use(chaiHttp);

let currentOrg, token;

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
      exp: ~~(Date.now() / 1000) + (parseInt(process.env.JWT_EXP) || 1 * 60 * 60), // Default expires in an hour
    },
    jwtSecret.secret,
  );
});

describe.only('Redacted ', function () {
  describe('GET /redacted_trails when DB is empty', function () {
    it('should return empty array for redacted trail', function (done) {
      chai
        .request(server.app)
        .get('/redacted_trails')
        .set('Authorization', `${token}`)
        .end(function (err, res) {
          res.should.have.status(200);
          res.should.be.json; // jshint ignore:line
          res.body.should.have.property('organization');
          res.body.organization.should.have.property('organization_id');
          res.body.organization.organization_id.should.equal(currentOrg.id);
          res.body.organization.should.have.property('name');
          res.body.organization.name.should.equal(currentOrg.name);
          res.body.organization.should.have.property('info_website_url');
          res.body.organization.info_website_url.should.equal(currentOrg.info_website_url);
          res.body.should.have.property('data');
          res.body.data.should.be.a('array');
          res.body.data.should.be.empty;
          done();
        });
    });
  });

  describe.only('GET /redacted_trails with some values', function () {
    before(async function () {
      await trails.deleteAllRows()

      const caseParams = {
        organization_id: currentOrg.id,
        state: 'published'
      };
      const mockCase = await mockData.mockCase(caseParams)

      // Add Trails
      let trailsParams = {
        caseId: mockCase.id
      }
      currentTrails = await mockData.mockTrails(5, 3600, trailsParams) // Generate 5 trails 1 hour apart
    });

    after(async function () {
      await trails.deleteAllRows();
    });

    it('should return all redacted trails', function (done) {
      chai
        .request(server.app)
        .get('/redacted_trails')
        .set('Authorization', `${token}`)
        .end(function (err, res) {
          console.log(res.body.data[0])
          res.should.have.status(200);
          res.should.be.json; // jshint ignore:line
          res.body.should.have.property('organization');
          res.body.organization.should.have.property('organization_id');
          res.body.organization.organization_id.should.equal(currentOrg.id);
          res.body.organization.should.have.property('name');
          res.body.organization.name.should.equal(currentOrg.name);
          res.body.organization.should.have.property('info_website_url');
          res.body.organization.info_website_url.should.equal(currentOrg.info_website_url);
          res.body.should.have.property('data');
          res.body.data.should.be.a('array');
          res.body.data[0].should.have.property('identifier');
          res.body.data[0].identifier.should.equal(
            'a88309c1-26cd-4d2b-8923-af0779e423a3',
          );
          res.body.data[0].should.have.property('organization_id');
          res.body.data[0].organization_id.should.equal(
            'a88309c2-26cd-4d2b-8923-af0779e423a3',
          );
          res.body.data[0].trail.should.be.a('array');
          res.body.data[0].trail[0].should.have.property('latitude');
          res.body.data[0].trail[0].latitude.should.equal(12.34);
          res.body.data[0].trail[0].should.have.property('longitude');
          res.body.data[0].trail[0].longitude.should.equal(12.34);
          res.body.data[0].trail[0].should.have.property('time');
          res.body.data[0].trail[0].time.should.equal(123456789);
          res.body.data[0].trail[1].should.have.property('latitude');
          res.body.data[0].trail[1].latitude.should.equal(12.34);
          res.body.data[0].trail[1].should.have.property('longitude');
          res.body.data[0].trail[1].longitude.should.equal(12.34);
          res.body.data[0].trail[1].should.have.property('time');
          res.body.data[0].trail[1].time.should.equal(123456789);
          res.body.data[0].should.have.property('user_id');
          done();
        });
    });
  });

  describe('POST /redacted_trail', function () {
    afterEach(async function () {
      await trails.deleteAllRows();
    });

    it('should check for correct JWT token', function (done) {
      chai
        .request(server.app)
        .post('/redacted_trail')
        .send({
          identifier: 'a88309c4-26cd-4d2b-8923-af0779e423a3',
          trail: [
            {
              time: 123456789,
              latitude: 12.34,
              longitude: 12.34,
            },
          ],
        })
        .set('Authorization', `somebadtoken`)
        .end(function (err, res) {
          res.should.have.status(401);
          res.text.should.equal('Unauthorized');
          done();
        });
    });

    it('should check for unexpired JWT token', function (done) {
      chai
        .request(server.app)
        .post('/redacted_trail')
        .send({
          identifier: 'a88309c4-26cd-4d2b-8923-af0779e423a3',
          trail: [
            {
              time: 123456789,
              latitude: 12.34,
              longitude: 12.34,
            },
          ],
        })
        .set('Authorization', `${ADMIN_JWT_TOKEN_EXPIRED}`)
        .end(function (err, res) {
          res.should.have.status(401);
          res.text.should.equal('Unauthorized');
          done();
        });
    });

    it('should fail when redacted trail is empty', function (done) {
      chai
        .request(server.app)
        .post('/redacted_trail')
        .send({
          identifier: 'a88309c4-26cd-4d2b-8923-af0779e423a3',
          trail: [],
        })
        .set('Authorization', `${ADMIN_JWT_TOKEN}`)
        .end(function (err, res) {
          res.should.have.status(400);
          res.should.be.json; // jshint ignore:line
          res.body.should.have.property('message');
          res.body.message.should.equal('Trail can not be empty.');
          done();
        });
    });

    it('should accept redacted trail', function (done) {
      chai
        .request(server.app)
        .post('/redacted_trail')
        .send({
          identifier: 'a88309c4-26cd-4d2b-8923-af0779e423a3',
          trail: [
            {
              time: 123456789,
              latitude: 12.34,
              longitude: 12.34,
            },
          ],
        })
        .set('Authorization', `${ADMIN_JWT_TOKEN}`)
        .end(function (err, res) {
          res.should.have.status(200);
          res.should.be.json; // jshint ignore:line
          res.body.should.have.property('data');
          res.body.data.should.be.a('object');
          res.body.data.should.have.property('identifier');
          res.body.data.identifier.should.equal(
            'a88309c4-26cd-4d2b-8923-af0779e423a3',
          );
          res.body.data.should.have.property('organization_id');
          res.body.data.organization_id.should.equal(
            'a88309c2-26cd-4d2b-8923-af0779e423a3',
          );
          res.body.data.should.have.property('trail');
          res.body.data.trail.should.be.a('array');
          res.body.data.trail[0].should.be.a('object');
          res.body.data.trail[0].should.have.property('latitude');
          res.body.data.trail[0].latitude.should.equal(12.34);
          res.body.data.trail[0].should.have.property('longitude');
          res.body.data.trail[0].longitude.should.equal(12.34);
          res.body.data.trail[0].should.have.property('time');
          res.body.data.trail[0].time.should.equal(123456789);
          res.body.data.should.have.property('user_id');
          res.body.data.user_id.should.equal(
            'a88309ca-26cd-4d2b-8923-af0779e423a3',
          );
          res.body.should.have.property('success');
          res.body.success.should.equal(true);
          done();
        });
    });

    it('should accept multiple co-ordinates in redacted trail', function (done) {
      chai
        .request(server.app)
        .post('/redacted_trail')
        .send({
          identifier: 'a88309c4-26cd-4d2b-8923-af0779e423a3',
          trail: [
            {
              time: 123456789,
              latitude: 12.34,
              longitude: 12.34,
            },
            {
              time: 123456790,
              latitude: 12.34,
              longitude: 12.34,
            },
          ],
        })
        .set('Authorization', `${ADMIN_JWT_TOKEN}`)
        .end(function (err, res) {
          res.should.have.status(200);
          res.should.be.json; // jshint ignore:line
          res.body.should.have.property('data');
          res.body.data.should.be.a('object');
          res.body.data.should.have.property('identifier');
          res.body.data.identifier.should.equal(
            'a88309c4-26cd-4d2b-8923-af0779e423a3',
          );
          res.body.data.should.have.property('organization_id');
          res.body.data.organization_id.should.equal(
            'a88309c2-26cd-4d2b-8923-af0779e423a3',
          );
          res.body.data.should.have.property('trail');
          res.body.data.trail.should.be.a('array');
          res.body.data.trail[0].should.be.a('object');
          res.body.data.trail[0].should.have.property('latitude');
          res.body.data.trail[0].latitude.should.equal(12.34);
          res.body.data.trail[0].should.have.property('longitude');
          res.body.data.trail[0].longitude.should.equal(12.34);
          res.body.data.trail[0].should.have.property('time');
          res.body.data.trail[0].time.should.equal(123456789);
          res.body.data.trail[1].should.be.a('object');
          res.body.data.trail[1].should.have.property('latitude');
          res.body.data.trail[1].latitude.should.equal(12.34);
          res.body.data.trail[1].should.have.property('longitude');
          res.body.data.trail[1].longitude.should.equal(12.34);
          res.body.data.trail[1].should.have.property('time');
          res.body.data.trail[1].time.should.equal(123456790);
          res.body.data.should.have.property('user_id');
          res.body.data.user_id.should.equal(
            'a88309ca-26cd-4d2b-8923-af0779e423a3',
          );
          res.body.should.have.property('success');
          res.body.success.should.equal(true);
          done();
        });
    });
  });
});
