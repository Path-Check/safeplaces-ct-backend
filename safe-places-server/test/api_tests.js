process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

const atob = require("atob");
const bcrypt = require('bcrypt');
var chai = require('chai');
var should = chai.should();
var chaiHttp = require('chai-http');
var server = require('../app');

const ADMIN_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluIiwiaWF0IjoxNTg3MzQyMjE1fQ.am7oekp9nm97lnRJbfxUMIKt_OqUmGpcIxyrrsCckp4';


chai.use(chaiHttp);

describe('GET /health', function() {
  it('should return 200 and all ok message', function(done) {
    chai.request(server)
    .get('/health')
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json; // jshint ignore:line
      res.body.should.have.property('message');
      res.body.message.should.be.equal('All Ok!');
      done();
    });
  });
});

describe('GET /redacted_trails', function() {
  it('should return all redacted trails', function(done) {
    chai.request(server)
    .get('/redacted_trails')
    .set('Authorization', `Bearer ${ADMIN_JWT_TOKEN}`)
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json; // jshint ignore:line
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
      res.body.data[0].should.have.property('user_id');
      res.body.data[0].user_id.should.equal('a88309ca-26cd-4d2b-8923-af0779e423a3');
      res.body.data[1].should.have.property('identifier');
      res.body.data[1].identifier.should.equal('a88309c1-26cd-4d2b-8923-af0779e423a4');
      res.body.data[1].should.have.property('organization_id');
      res.body.data[1].organization_id.should.equal('a88309c2-26cd-4d2b-8923-af0779e423a3');
      res.body.data[1].trail.should.be.a('array');
      res.body.data[1].trail[0].should.have.property('latitude');
      res.body.data[1].trail[0].latitude.should.equal(12.34);
      res.body.data[1].trail[0].should.have.property('longitude');
      res.body.data[1].trail[0].longitude.should.equal(12.34);
      res.body.data[1].trail[0].should.have.property('time');
      res.body.data[1].trail[0].time.should.equal(123456789);
      res.body.data[1].should.have.property('user_id');
      res.body.data[1].user_id.should.equal('a88309ca-26cd-4d2b-8923-af0779e423a3');
      done();
    });
  });
});

describe('POST /redacted_trail', function() {
  it('should accept redacted trail', function(done) {
    chai.request(server)
    .post('/redacted_trail')
    .send({
      "identifier": 'a88309c4-26cd-4d2b-8923-af0779e423a3',
      "trail":[
        {
          "time": 123456789,
          "latitude": 12.34,
          "longitude": 12.34
        }
      ]
    })
    .set('Authorization', `Bearer ${ADMIN_JWT_TOKEN}`)
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json; // jshint ignore:line
      res.body.should.have.property('data');
      res.body.data.should.be.a('object');
      res.body.data.should.have.property('identifier');
      res.body.data.identifier.should.equal('a88309c1-26cd-4d2b-8923-af0779e423a3');
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
});

describe('GET /safe_path', function() {
  it('should return an organization`s safe paths', function(done) {
    chai.request(server)
    .get('/safe_path/a88309c2-26cd-4d2b-8923-af0779e423a3')
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json; // jshint ignore:line
      res.body.should.be.a('object');
      res.body.should.have.property('authority_name');
      res.body.authority_name.should.equal('Fake Organization');
      res.body.should.have.property('concern_points');
      res.body.concern_points.should.be.a('array');
      res.body.concern_points[0].should.be.a('object');
      res.body.concern_points[0].should.have.property('latitude');
      res.body.concern_points[0].latitude.should.equal(12.34);
      res.body.concern_points[0].should.have.property('longitude');
      res.body.concern_points[0].longitude.should.equal(12.34);
      res.body.concern_points[0].should.have.property('time');
      res.body.concern_points[0].time.should.equal(1584924233);
      res.body.concern_points[1].should.have.property('latitude');
      res.body.concern_points[1].latitude.should.equal(12.34);
      res.body.concern_points[1].should.have.property('longitude');
      res.body.concern_points[1].longitude.should.equal(12.34);
      res.body.concern_points[1].should.have.property('time');
      res.body.concern_points[1].time.should.equal(1584924583);
      res.body.should.have.property('info_website');
      res.body.info_website.should.equal('https://www.something.gov/path/to/info/website');
      res.body.should.have.property('publish_date_utc');
      res.body.publish_date_utc.should.equal('1584924583');
      done();
    });
  });
});

describe('POST /safe_paths', function() {
  it('should accept safe path being submitted', function(done) {
    chai.request(server)
    .post('/safe_paths')
    .send({
      "authority_name":  "Steve's Fake Testing Organization",
      "publish_date_utc": 1584924583,
      "info_website": "https://www.who.int/emergencies/diseases/novel-coronavirus-2019",
      "concern_points":
      [
        {
          "time": 123,
          "latitude": 12.34,
          "longitude": 12.34
        },
        {
          "time": 456,
          "latitude": 12.34,
          "longitude": 12.34
        }
      ]
    })
    .set('Authorization', `Bearer ${ADMIN_JWT_TOKEN}`)
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json; // jshint ignore:line
      res.body.should.be.a('object');
      res.body.should.have.property('datetime_created');
      res.body.datetime_created.should.equal('Fri, 27 Mar 2020 04:32:12 GMT');
      res.body.should.have.property('organization_id');
      res.body.organization_id.should.equal('a88309c2-26cd-4d2b-8923-af0779e423a3');
      res.body.should.have.property('safe_path');
      res.body.safe_path.should.be.a('object');
      res.body.safe_path.should.have.property('authority_name');
      res.body.safe_path.authority_name.should.equal('Fake Organization');
      res.body.safe_path.should.have.property('concern_points');
      res.body.safe_path.concern_points.should.be.a('array');
      res.body.safe_path.concern_points[0].should.be.a('object');
      res.body.safe_path.concern_points[0].should.have.property('latitude');
      res.body.safe_path.concern_points[0].latitude.should.equal(12.34);
      res.body.safe_path.concern_points[0].should.have.property('longitude');
      res.body.safe_path.concern_points[0].longitude.should.equal(12.34);
      res.body.safe_path.concern_points[0].should.have.property('time');
      res.body.safe_path.concern_points[0].time.should.equal(123);
      res.body.safe_path.concern_points[1].should.have.property('latitude');
      res.body.safe_path.concern_points[1].latitude.should.equal(12.34);
      res.body.safe_path.concern_points[1].should.have.property('longitude');
      res.body.safe_path.concern_points[1].longitude.should.equal(12.34);
      res.body.safe_path.concern_points[1].should.have.property('time');
      res.body.safe_path.concern_points[1].time.should.equal(456);
      res.body.safe_path.should.have.property('info_website');
      res.body.safe_path.info_website.should.equal('https://www.something.gov/path/to/info/website');
      res.body.safe_path.should.have.property('publish_date_utc');
      res.body.safe_path.publish_date_utc.should.equal(1584924583);
      res.body.should.have.property('user_id');
      res.body.user_id.should.equal('a88309c1-26cd-4d2b-8923-af0779e423a3');
      done();
    });
  });
});

function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

describe('POST /login', function() {
  it('should login on user creds and return map api key', function(done) {
    chai.request(server)
    .post('/login')
    .send({
      username: 'admin',
      password : 'admin'
    })
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json; // jshint ignore:line
      res.body.should.have.property('token');
      let parsedJwt = parseJwt(res.body.token);
      parsedJwt.id.should.equal('admin');
      res.body.should.have.property('maps_api_key');
      res.body.maps_api_key.should.equal('api_key_value');
      done();
    });
  });
});
