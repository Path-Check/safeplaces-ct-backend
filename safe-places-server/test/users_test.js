process.env.NODE_ENV = 'test';

var chai = require('chai');
var should = chai.should();
var chaiHttp = require('chai-http');
var server = require('../app');



chai.use(chaiHttp);

describe('GET /users', function() {
    it('should return all users', function(done) {
      chai.request(server)
      .get('/users')
      .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json; // jshint ignore:line
      res.body.should.be.a('array');
      res.body[0].should.have.property('username');
      res.body[0].username.should.equal('someuser');
      res.body[0].should.have.property('password');
      res.body[0].password.should.equal('something');
      res.body[0].should.have.property('salt');
      res.body[0].salt.should.equal('something');
      done();
      });
    });
  });
  