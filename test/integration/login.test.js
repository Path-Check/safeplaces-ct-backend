process.env.NODE_ENV = 'test';

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

describe('POST /login', function () {
  it('should login on user creds and return map api key', function (done) {
    chai
      .request(server.app)
      .post('/login')
      .send({
        username: 'spladmin',
        password: 'password',
      })
      .end(function (err, res) {
        expect(res.status).to.equal(204);

        expect(res.header).to.haveOwnProperty('set-cookie');

        let accessTokenCookie = null;
        for (const cookie of res.header['set-cookie']) {
          if (cookie.startsWith('access_token=')) {
            accessTokenCookie = cookie.replace('access_token=', '');
            break;
          }
        }

        const parsedJwt = parseJwt(accessTokenCookie);

        expect(parsedJwt).to.haveOwnProperty('sub');
        expect(parsedJwt.sub).to.equal('spladmin');

        expect(parsedJwt).to.haveOwnProperty('iat');
        expect(parsedJwt).to.haveOwnProperty('exp');

        return done();
      });
  });

  it('should fail when wrong password is given saying creds are invalid', function (done) {
    chai
      .request(server.app)
      .post('/login')
      .send({
        username: 'spladmin',
        password: 'wrongpassword',
      })
      .end(function (err, res) {
        expect(res.status).to.equal(401);

        expect(res.body).to.be.an('object');
        expect(res.body).to.haveOwnProperty('message');
        expect(res.body.message).to.equal('Invalid credentials');

        return done();
      });
  });

  it('should fail with invalid username saying creds are invalid', function (done) {
    chai
      .request(server.app)
      .post('/login')
      .send({
        username: 'wronguser',
        password: 'password',
      })
      .end(function (err, res) {
        expect(res.status).to.equal(401);

        expect(res.body).to.be.an('object');
        expect(res.body).to.haveOwnProperty('message');
        expect(res.body.message).to.equal('Invalid credentials');

        return done();
      });
  });
});
