process.env.NODE_ENV = 'test';

const atob = require("atob");
const bcrypt = require('bcrypt');
var chai = require('chai');
var should = chai.should();
var chaiHttp = require('chai-http');
var server = require('../app');

const ADMIN_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluIiwiaWF0IjoxNTg3MzQyMjE1fQ.am7oekp9nm97lnRJbfxUMIKt_OqUmGpcIxyrrsCckp4';


chai.use(chaiHttp);

describe('GET /users', function() {
  it('should return all users', function(done) {
    chai.request(server)
    .get('/users')
    .set('Authorization', `Bearer ${ADMIN_JWT_TOKEN}`)
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json; // jshint ignore:line
      res.body.should.be.a('array');
      res.body[0].should.have.property('username');
      res.body[0].username.should.equal('admin');
      res.body[0].should.have.property('password');
      bcrypt.compare('admin', res.body[0].password, function(err, check){
        if (err){
          return done(err);
        }
      });
      res.body[0].should.have.property('email');
      res.body[0].email.should.equal('admin@org.com');
      res.body[0].should.have.property('maps_api_key');
      res.body[0].maps_api_key.should.equal('api_key_value');
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
};

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
  