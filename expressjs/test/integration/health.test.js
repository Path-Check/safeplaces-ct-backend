process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

var chai = require('chai');
var should = chai.should(); // eslint-disable-line
var chaiHttp = require('chai-http');
var server = require('../../app');

chai.use(chaiHttp);

describe('GET /health', function () {
  it('should return 200 and all ok message', function (done) {
    chai
      .request(server.app)
      .get('/health')
      .end(function (err, res) {
        res.should.have.status(200);
        res.should.be.json; // jshint ignore:line
        res.body.should.have.property('message');
        res.body.message.should.be.equal('All Ok!');
        done();
      });
  });
});
