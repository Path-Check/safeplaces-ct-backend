process.env.NODE_ENV = 'test';
const atob = require('atob');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const app = require('../../app');
const server = app.getTestingServer();

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

  it('should login on admin user creds', function (done) {
    chai
      .request(server)
      .post('/auth/login')
      .send({
        username: 'safeplaces@extremesolution.com',
        password: 'Wx$sRj3E',
      })
      .end(function (err, res) {
        const ns = process.env.AUTH0_CLAIM_NAMESPACE;

        expect(res.status).to.equal(200);
        expect(res.body).to.haveOwnProperty('id');

        const accessToken = /access_token=([a-zA-Z0-9.\-_]+);/g.exec(
          res.header['set-cookie'],
        )[1];

        const parsedJwt = parseJwt(accessToken);
        expect(parsedJwt).to.haveOwnProperty('sub');
        expect(parsedJwt.sub).to.equal('auth0|5f246391675616003785f947');
        expect(parsedJwt).to.haveOwnProperty(`${ns}/roles`);
        expect(parsedJwt[`${ns}/roles`]).to.have.members(['admin']);
        expect(parsedJwt).to.haveOwnProperty('iat');

        chai.assert.equal(new Date(parsedJwt.iat * 1000) instanceof Date, true);
        expect(parsedJwt).to.haveOwnProperty('exp');
        chai.assert.equal(new Date(parsedJwt.exp * 1000) instanceof Date, true);

        return done();
      });
  });

  it('should login on contact tracer user creds', function (done) {
    chai
      .request(server)
      .post('/auth/login')
      .send({
        username: 'tracer@extremesolution.com',
        password: 'cX#Ee7sR',
      })
      .end(function (err, res) {
        const ns = process.env.AUTH0_CLAIM_NAMESPACE;

        expect(res.status).to.equal(200);
        expect(res.body).to.haveOwnProperty('id');

        const accessToken = /access_token=([a-zA-Z0-9.\-_]+);/g.exec(
          res.header['set-cookie'],
        )[1];

        const parsedJwt = parseJwt(accessToken);
        expect(parsedJwt).to.haveOwnProperty('sub');
        expect(parsedJwt.sub).to.equal('auth0|5f1f0f32314999003d05021e');
        expect(parsedJwt).to.haveOwnProperty(`${ns}/roles`);
        expect(parsedJwt[`${ns}/roles`]).to.have.members(['contact_tracer']);
        expect(parsedJwt).to.haveOwnProperty('iat');

        chai.assert.equal(new Date(parsedJwt.iat * 1000) instanceof Date, true);
        expect(parsedJwt).to.haveOwnProperty('exp');
        chai.assert.equal(new Date(parsedJwt.exp * 1000) instanceof Date, true);

        return done();
      });
  });

  /*
  it('should fail when wrong password is given saying creds are invalid', function (done) {
    chai
      .request(server)
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
      .request(server)
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
  */
});
