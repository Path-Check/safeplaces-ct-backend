process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwtSecret = require('../config/jwtConfig');
const jwt = require('jsonwebtoken');
const server = require('../app');
const trails = require('../db/models/trails');

const ORGANISATION_ID = 'a88309c2-26cd-4d2b-8923-af0779e423a3';
const USER_ID = 'a88309ca-26cd-4d2b-8923-af0779e423a3';
const USERNAME = 'admin';
const ADMIN_JWT_TOKEN = jwt.sign(
  {
    sub: USERNAME,
    iat: ~~(Date.now() / 1000),
    exp: ~~(Date.now() / 1000) + (parseInt(process.env.JWT_EXP) || (1 * 60 * 60)) // Default expires in an hour
  },
  jwtSecret.secret
);

const ADMIN_JWT_TOKEN_EXPIRED = jwt.sign(
  {
    sub: USERNAME,
    iat: ~~(Date.now() / 1000),
    exp: ~~(Date.now() / 1000) - 1
  },
  jwtSecret.secret
);

chai.use(chaiHttp);

describe('Redacted ', function() {

  describe('GET /redacted_trails when DB is empty', function() {

    it('should return empty array for redacted trail', function(done) {
      chai.request(server.app)
        .get('/redacted_trails')
        .set('Authorization', `${ADMIN_JWT_TOKEN}`)
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json; // jshint ignore:line
          res.body.should.have.property('organization');
          res.body.organization.should.have.property('organization_id');
          res.body.organization.organization_id.should.equal('a88309c2-26cd-4d2b-8923-af0779e423a3');
          res.body.organization.should.have.property('authority_name');
          res.body.organization.authority_name.should.equal('Test Organization');
          res.body.organization.should.have.property('info_website');
          res.body.organization.info_website.should.equal(
            'https://www.who.int/emergencies/diseases/novel-coronavirus-2019');
          res.body.organization.should.have.property('safe_path_json');
          res.body.organization.safe_path_json.should.equal(
            'https://www.something.give/safe_path/a88309c2-26cd-4d2b-8923-af0779e423a3');
          res.body.should.have.property('data');
          res.body.data.should.be.a('array');
          res.body.data.should.be.empty;
          done();
        });
    });
  });

  describe('GET /redacted_trails with some values', function() {

    before(async function(){
      await trails.deleteAllRows();
      let trail = [
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 123456789
        },
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 123456789
        }
      ];
      let identifier = 'a88309c1-26cd-4d2b-8923-af0779e423a3';
      await trails.insertRedactedTrailSet(
        trail,
        identifier,
        ORGANISATION_ID,
        USER_ID
      );
    });

    after(async function(){
      await trails.deleteAllRows();
    });

    it('should return all redacted trails', function(done) {
      chai.request(server.app)
      .get('/redacted_trails')
      .set('Authorization', `${ADMIN_JWT_TOKEN}`)
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json; // jshint ignore:line
        res.body.should.have.property('organization');
        res.body.organization.should.have.property('organization_id');
        res.body.organization.organization_id.should.equal('a88309c2-26cd-4d2b-8923-af0779e423a3');
        res.body.organization.should.have.property('authority_name');
        res.body.organization.authority_name.should.equal('Test Organization');
        res.body.organization.should.have.property('info_website');
        res.body.organization.info_website.should.equal(
          'https://www.who.int/emergencies/diseases/novel-coronavirus-2019');
        res.body.organization.should.have.property('safe_path_json');
        res.body.organization.safe_path_json.should.equal(
          'https://www.something.give/safe_path/a88309c2-26cd-4d2b-8923-af0779e423a3');
        res.body.should.have.property('data');
        res.body.data.should.be.a('array');
        res.body.data[0].should.have.property('identifier');
        res.body.data[0].identifier.should.equal('a88309c1-26cd-4d2b-8923-af0779e423a3');
        res.body.data[0].should.have.property('organization_id');
        res.body.data[0].organization_id.should.equal('a88309c2-26cd-4d2b-8923-af0779e423a3');
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

  describe('POST /redacted_trail', function() {

    afterEach(async function(){
      await trails.deleteAllRows();
    });

    it('should check for correct JWT token', function(done) {
      chai.request(server.app)
        .post('/redacted_trail')
        .send({
          'identifier': 'a88309c4-26cd-4d2b-8923-af0779e423a3',
          'trail': [
            {
              'time': 123456789,
              'latitude': 12.34,
              'longitude': 12.34
            }
          ]
        })
        .set('Authorization', `somebadtoken`)
        .end(function(err, res) {
          res.should.have.status(401);
          res.text.should.equal('Unauthorized');
          done();
        });
    });

    it('should check for unexpired JWT token', function(done) {
      chai.request(server.app)
      .post('/redacted_trail')
      .send({
        'identifier': 'a88309c4-26cd-4d2b-8923-af0779e423a3',
        'trail': [
          {
            'time': 123456789,
            'latitude': 12.34,
            'longitude': 12.34
          }
        ]
      })
      .set('Authorization', `${ADMIN_JWT_TOKEN_EXPIRED}`)
      .end(function(err, res) {
        res.should.have.status(401);
        res.text.should.equal('Unauthorized');
        done();
      });
    });

    it('should fail when redacted trail is empty', function(done) {
      chai.request(server.app)
      .post('/redacted_trail')
      .send({
        'identifier': 'a88309c4-26cd-4d2b-8923-af0779e423a3',
        'trail': []
      })
      .set('Authorization', `${ADMIN_JWT_TOKEN}`)
      .end(function(err, res) {
        res.should.have.status(400);
        res.should.be.json; // jshint ignore:line
        res.body.should.have.property('message');
        res.body.message.should.equal('Trail can not be empty.');
        done();
      });
    });

    it('should accept redacted trail', function(done) {
      chai.request(server.app)
        .post('/redacted_trail')
        .send({
          'identifier': 'a88309c4-26cd-4d2b-8923-af0779e423a3',
          'trail': [
            {
              'time': 123456789,
              'latitude': 12.34,
              'longitude': 12.34
            }
          ]
        })
        .set('Authorization', `${ADMIN_JWT_TOKEN}`)
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json; // jshint ignore:line
          res.body.should.have.property('data');
          res.body.data.should.be.a('object');
          res.body.data.should.have.property('identifier');
          res.body.data.identifier.should.equal('a88309c4-26cd-4d2b-8923-af0779e423a3');
          res.body.data.should.have.property('organization_id');
          res.body.data.organization_id.should.equal('a88309c2-26cd-4d2b-8923-af0779e423a3');
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
          res.body.data.user_id.should.equal('a88309ca-26cd-4d2b-8923-af0779e423a3');
          res.body.should.have.property('success');
          res.body.success.should.equal(true);
          done();
        });
    });

    it('should accept multiple co-ordinates in redacted trail', function(done) {
      chai.request(server.app)
      .post('/redacted_trail')
      .send({
        'identifier': 'a88309c4-26cd-4d2b-8923-af0779e423a3',
        'trail': [
          {
            'time': 123456789,
            'latitude': 12.34,
            'longitude': 12.34
          },
          {
            'time': 123456790,
            'latitude': 12.34,
            'longitude': 12.34
          }
        ]
      })
      .set('Authorization', `${ADMIN_JWT_TOKEN}`)
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json; // jshint ignore:line
        res.body.should.have.property('data');
        res.body.data.should.be.a('object');
        res.body.data.should.have.property('identifier');
        res.body.data.identifier.should.equal('a88309c4-26cd-4d2b-8923-af0779e423a3');
        res.body.data.should.have.property('organization_id');
        res.body.data.organization_id.should.equal('a88309c2-26cd-4d2b-8923-af0779e423a3');
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
        res.body.data.user_id.should.equal('a88309ca-26cd-4d2b-8923-af0779e423a3');
        res.body.should.have.property('success');
        res.body.success.should.equal(true);
        done();
      });
    });
  });

});
