process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

const atob = require('atob');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');

chai.use(chaiHttp);

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );

  return JSON.parse(jsonPayload);
}

describe('POST /login', function () {
  it('should login on user creds and return map api key', function (done) {
    chai
      .request(server.app)
      .post('/login')
      .send({
        username: 'admin',
        password: 'admin',
      })
      .end(function (err, res) {
        res.should.have.status(200);
        res.should.be.json; // jshint ignore:line
        res.body.should.have.property('token');
        let parsedJwt = parseJwt(res.body.token);
        parsedJwt.should.have.property('sub');
        parsedJwt.sub.should.equal('admin');
        parsedJwt.should.have.property('iat');
        chai.assert.equal(new Date(parsedJwt.iat * 1000) instanceof Date, true);
        parsedJwt.should.have.property('exp');
        chai.assert.equal(new Date(parsedJwt.exp * 1000) instanceof Date, true);
        res.body.should.have.property('maps_api_key');
        res.body.maps_api_key.should.equal(process.env.SEED_MAPS_API_KEY);
        done();
      });
  });

  it('should fail when wrong password is given saying creds are invalid', function (done) {
    chai
      .request(server.app)
      .post('/login')
      .send({
        username: 'admin',
        password: 'wrongpassword',
      })
      .end(function (err, res) {
        res.should.have.status(401);
        res.should.be.json; // jshint ignore:line
        res.body.should.have.property('message');
        res.body.message.should.equal('Invalid credentials.');
        done();
      });
  });

  it('should fail with invalid username saying creds are invalid', function (done) {
    chai
      .request(server.app)
      .post('/login')
      .send({
        username: 'invaliduser',
        password: 'somepassword',
      })
      .end(function (err, res) {
        res.should.have.status(401);
        res.should.be.json; // jshint ignore:line
        res.body.should.have.property('message');
        res.body.message.should.equal('Invalid credentials.');
        done();
      });
  });
});
