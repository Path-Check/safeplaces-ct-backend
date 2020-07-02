process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

const chai = require('chai');
const should = chai.should(); // eslint-disable-line
const chaiHttp = require('chai-http');

const app = require('../../app');
const server = app.getTestingServer();

chai.use(chaiHttp);

describe('GET /health', function () {
  it('should return 200 and all ok message', function (done) {
    chai
      .request(server)
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
