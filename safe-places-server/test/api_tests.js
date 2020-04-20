process.env.NODE_ENV = 'test';

const atob = require("atob");
const bcrypt = require('bcrypt');
var chai = require('chai');
var should = chai.should();
var chaiHttp = require('chai-http');
var server = require('../app');

const ADMIN_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluIiwiaWF0IjoxNTg3MzQyMjE1fQ.am7oekp9nm97lnRJbfxUMIKt_OqUmGpcIxyrrsCckp4';


chai.use(chaiHttp);

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
      res.body.data[0].trail.should.be.a('object');
      res.body.data[0].trail.should.have.property('latitude');
      res.body.data[0].trail.latitude.should.equal(12.34);
      res.body.data[0].trail.should.have.property('longitude');
      res.body.data[0].trail.longitude.should.equal(12.34);
      res.body.data[0].trail.should.have.property('time');
      res.body.data[0].trail.time.should.equal(123456789);
      res.body.data[0].should.have.property('user_id');
      res.body.data[0].user_id.should.equal('a88309ca-26cd-4d2b-8923-af0779e423a3');
      res.body.data[1].should.have.property('identifier');
      res.body.data[1].identifier.should.equal('a88309c1-26cd-4d2b-8923-af0779e423a4');
      res.body.data[1].should.have.property('organization_id');
      res.body.data[1].organization_id.should.equal('a88309c2-26cd-4d2b-8923-af0779e423a3');
      res.body.data[1].trail.should.be.a('object');
      res.body.data[1].trail.should.have.property('latitude');
      res.body.data[1].trail.latitude.should.equal(12.34);
      res.body.data[1].trail.should.have.property('longitude');
      res.body.data[1].trail.longitude.should.equal(12.34);
      res.body.data[1].trail.should.have.property('time');
      res.body.data[1].trail.time.should.equal(123456789);
      res.body.data[1].should.have.property('user_id');
      res.body.data[1].user_id.should.equal('a88309ca-26cd-4d2b-8923-af0779e423a3');
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
