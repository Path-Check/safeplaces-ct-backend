const atob = require('atob');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const server = require('../../app');

chai.use(chaiHttp);

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );

  return JSON.parse(jsonPayload);
}

describe('POST /auth/login', function () {
  this.timeout(5000);

  it('should login on user creds and return map api key', function (done) {
    chai
      .request(server.app)
      .post('/auth/login')
      .send({
        username: 'safeplaces@extremesolution.com',
        password: 'Wx$sRj3E',
      })
      .end(function (err, res) {
        expect(res.status).to.equal(204);
        expect(Object.keys(res.body).length).to.eq(0);
        const accessToken = /access_token=([a-zA-Z0-9.\-_]+);/g.exec(
          res.header['set-cookie'],
        )[1];
        const parsedJwt = parseJwt(accessToken);
        expect(parsedJwt).to.haveOwnProperty('sub');
        expect(parsedJwt.sub).to.equal('auth0|5ef53cdcf3ce32001a40ede7');
        expect(parsedJwt).to.haveOwnProperty('iat');
        chai.assert.equal(new Date(parsedJwt.iat * 1000) instanceof Date, true);
        expect(parsedJwt).to.haveOwnProperty('exp');
        chai.assert.equal(new Date(parsedJwt.exp * 1000) instanceof Date, true);
        return done();
      });
  });

  it('should fail when wrong password is given saying creds are invalid', function (done) {
    chai
      .request(server.app)
      .post('/auth/login')
      .send({
        username: 'safeplaces@extremesolution.com',
        password: 'wrongpassword',
      })
      .end(function (err, res) {
        expect(res.status).to.equal(401);
        expect(res.text).to.be.a('string');
        expect(res.text).to.equal('Unauthorized');
        return done();
      });
  });

  it('should fail with invalid username saying creds are invalid', function (done) {
    chai
      .request(server.app)
      .post('/auth/login')
      .send({
        username: 'wronguser',
        password: 'password',
      })
      .end(function (err, res) {
        expect(res.status).to.equal(401);
        expect(res.text).to.be.a('string');
        expect(res.text).to.equal('Unauthorized');
        return done();
      });
  });
});
