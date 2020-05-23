process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwtSecret = require('../../config/jwtConfig');
const jwt = require('jsonwebtoken');
const server = require('../../app');
const trails = require('../../db/models/trails');
const publications = require('../../db/models/publications');

const ORGANISATION_ID = 'a88309c2-26cd-4d2b-8923-af0779e423a3';
const USER_ID = 'a88309ca-26cd-4d2b-8923-af0779e423a3';
const USERNAME = 'admin';
const ADMIN_JWT_TOKEN = jwt.sign(
  {
    sub: USERNAME,
    iat: ~~(Date.now() / 1000),
    exp: ~~(Date.now() / 1000) + (parseInt(process.env.JWT_EXP) || 1 * 60 * 60), // Default expires in an hour
  },
  jwtSecret.secret,
);

chai.use(chaiHttp);

describe('Safe Path ', function () {
  describe('GET /safe_path without redacted_trails and with publication', function () {
    before(async () => {
      await trails.deleteAllRows();

      let trail = [
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 123456789,
        },
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 123456789,
        },
      ];
      let identifier = 'a88309c1-26cd-4d2b-8923-af0779e423a3';
      await trails.insertRedactedTrailSet(
        trail,
        identifier,
        ORGANISATION_ID,
        USER_ID,
      );

      await publications.deleteAllRows();

      let publication = {
        organization_id: ORGANISATION_ID,
        user_id: USER_ID,
        start_date: 158494125,
        end_date: 1584924583,
        publish_date: 1584924583,
      };
      await publications.insert(publication);
    });

    after(async function () {
      await publications.deleteAllRows();
    });

    it('should return an organization`s safe paths as empty', function (done) {
      chai
        .request(server.app)
        .get('/safe_path/a88309c2-26cd-4d2b-8923-af0779e423a3')
        .end(function (err, res) {
          res.should.have.status(200);
          res.should.be.json; // jshint ignore:line
          res.body.should.be.a('object');
          res.body.should.have.property('authority_name');
          res.body.authority_name.should.equal('Test Organization');
          res.body.should.have.property('concern_points');
          res.body.concern_points.should.be.a('array');
          res.body.concern_points.should.be.empty;
          res.body.should.have.property('info_website');
          res.body.info_website.should.equal(
            'https://www.who.int/emergencies/diseases/novel-coronavirus-2019',
          );
          res.body.should.have.property('publish_date');
          res.body.publish_date.should.equal(1584924583);
          done();
        });
    });
  });

  describe('GET /safe_path with redacted_trails and without publication', function () {
    const trailIdentifier = 'a88309c1-26cd-4d2b-8923-af0779e423a3';
    before(async function () {
      await trails.deleteAllRows();
      let trail = [
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 1584924123,
        },
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 1584924456,
        },
      ];
      await trails.insertRedactedTrailSet(
        trail,
        trailIdentifier,
        ORGANISATION_ID,
        USER_ID,
      );
    });

    after(async function () {
      await trails.deleteAllRows();
    });

    it('should return an organization`s safe paths as empty', function (done) {
      chai
        .request(server.app)
        .get('/safe_path/a88309c2-26cd-4d2b-8923-af0779e423a3')
        .end(function (err, res) {
          res.should.have.status(204);
          res.body.should.be.empty;
          done();
        });
    });
  });

  describe('GET /safe_path with redacted_trails and publication', function () {
    before(async function () {
      await trails.deleteAllRows();

      let trail = [
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 1584924123,
        },
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 1584924456,
        },
      ];
      let identifier = 'a88309c1-26cd-4d2b-8923-af0779e423a3';
      await trails.insertRedactedTrailSet(
        trail,
        identifier,
        ORGANISATION_ID,
        USER_ID,
      );

      await publications.deleteAllRows();
      let publication = {
        organization_id: ORGANISATION_ID,
        user_id: USER_ID,
        start_date: 158494125,
        end_date: 1584924583,
        publish_date: 1584924583,
      };
      await publications.insert(publication);
    });

    after(async function () {
      await trails.deleteAllRows();
      await publications.deleteAllRows();
    });

    it('should return an organization`s safe paths', function (done) {
      chai
        .request(server.app)
        .get('/safe_path/a88309c2-26cd-4d2b-8923-af0779e423a3')
        .end(function (err, res) {
          res.should.have.status(200);
          res.should.be.json; // jshint ignore:line
          res.body.should.be.a('object');
          res.body.should.have.property('authority_name');
          res.body.authority_name.should.equal('Test Organization');
          res.body.should.have.property('concern_points');
          res.body.concern_points.should.be.a('array');
          res.body.concern_points[0].should.be.a('object');
          res.body.concern_points[0].should.have.property('latitude');
          res.body.concern_points[0].latitude.should.equal(12.34);
          res.body.concern_points[0].should.have.property('longitude');
          res.body.concern_points[0].longitude.should.equal(12.34);
          res.body.concern_points[0].should.have.property('time');
          res.body.concern_points[0].time.should.equal(1584924123);
          res.body.concern_points[1].should.have.property('latitude');
          res.body.concern_points[1].latitude.should.equal(12.34);
          res.body.concern_points[1].should.have.property('longitude');
          res.body.concern_points[1].longitude.should.equal(12.34);
          res.body.concern_points[1].should.have.property('time');
          res.body.concern_points[1].time.should.equal(1584924456);
          res.body.should.have.property('info_website');
          res.body.info_website.should.equal(
            'https://www.who.int/emergencies/diseases/novel-coronavirus-2019',
          );
          res.body.should.have.property('publish_date');
          res.body.publish_date.should.equal(1584924583);
          done();
        });
    });
  });

  describe('GET /safe_paths with cursor', () => {
    before(async () => {

    });

    after(async () => {
      await trails.deleteAllRows();
      await publications.deleteAllRows();
    });

    it('cursor is empty', async () => {
      
    });

    it('cursor is not empty', async () => {
      
    });
  });

  describe('POST /safe_paths without redacted trails', function () {
    after(async function () {
      await publications.deleteAllRows();
    });

    it('should accept safe path being submitted and create publication record', function (done) {
      chai
        .request(server.app)
        .post('/safe_paths')
        .send({
          authority_name: 'Test Organization',
          publish_date: 1584924583,
          info_website:
            'https://www.who.int/emergencies/diseases/novel-coronavirus-2019',
          safe_path_json:
            'https://www.something.give/safe_path/a88309c2-26cd-4d2b-8923-af0779e423a3',
          start_date: 158494125,
          end_date: 1584924583,
          // Ignores concern_points
          concern_points: [
            {
              time: 1584924123,
              latitude: 12.34,
              longitude: 12.34,
            },
            {
              time: 1584924456,
              latitude: 12.34,
              longitude: 12.34,
            },
          ],
        })
        .set('Authorization', `${ADMIN_JWT_TOKEN}`)
        .end(function (err, res) {
          res.should.have.status(200);
          res.should.be.json; // jshint ignore:line
          res.body.should.be.a('object');
          res.body.should.have.property('datetime_created');
          chai.assert.equal(
            new Date(res.body.datetime_created) instanceof Date,
            true,
          );
          res.body.should.have.property('organization_id');
          res.body.organization_id.should.equal(
            'a88309c2-26cd-4d2b-8923-af0779e423a3',
          );
          res.body.should.have.property('safe_path');
          res.body.safe_path.should.be.a('object');
          res.body.safe_path.should.have.property('authority_name');
          res.body.safe_path.authority_name.should.equal('Test Organization');
          res.body.safe_path.should.have.property('concern_points');
          res.body.safe_path.concern_points.should.be.a('array');
          res.body.safe_path.concern_points.should.be.empty;
          res.body.safe_path.should.have.property('info_website');
          res.body.safe_path.info_website.should.equal(
            'https://www.who.int/emergencies/diseases/novel-coronavirus-2019',
          );
          res.body.safe_path.should.have.property('publish_date');
          res.body.safe_path.publish_date.should.equal(1584924583);
          res.body.should.have.property('user_id');
          res.body.user_id.should.equal('a88309ca-26cd-4d2b-8923-af0779e423a3');
          done();
        });
    });
  });

  describe('POST /safe_paths with redacted trails and start_date, end_date respects interval', function () {
    before(async function () {
      await trails.deleteAllRows();
      let trail = [
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 1584924123,
        },
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 1584924456,
        },
      ];
      let identifier = 'a88309c1-26cd-4d2b-8923-af0779e423a3';
      await trails.insertRedactedTrailSet(
        trail,
        identifier,
        ORGANISATION_ID,
        USER_ID,
      );
    });

    after(async function () {
      await trails.deleteAllRows();
      await publications.deleteAllRows();
    });

    it('should accept safe path being submitted', function (done) {
      chai
        .request(server.app)
        .post('/safe_paths')
        .send({
          authority_name: 'Test Organization',
          publish_date: 1584924583,
          info_website:
            'https://www.who.int/emergencies/diseases/novel-coronavirus-2019',
          safe_path_json:
            'https://www.something.give/safe_path/a88309c2-26cd-4d2b-8923-af0779e423a3',
          start_date: 158494125,
          end_date: 1584924300,
          concern_points: [
            {
              time: 1584924123,
              latitude: 12.34,
              longitude: 12.34,
            },
            {
              time: 1584924456,
              latitude: 12.34,
              longitude: 12.34,
            },
          ],
        })
        .set('Authorization', `${ADMIN_JWT_TOKEN}`)
        .end(function (err, res) {
          res.should.have.status(200);
          res.should.be.json; // jshint ignore:line
          res.body.should.be.a('object');
          res.body.should.have.property('datetime_created');
          chai.assert.equal(
            new Date(res.body.datetime_created) instanceof Date,
            true,
          );
          res.body.should.have.property('organization_id');
          res.body.organization_id.should.equal(
            'a88309c2-26cd-4d2b-8923-af0779e423a3',
          );
          res.body.should.have.property('safe_path');
          res.body.safe_path.should.be.a('object');
          res.body.safe_path.should.have.property('authority_name');
          res.body.safe_path.authority_name.should.equal('Test Organization');
          res.body.safe_path.should.have.property('concern_points');
          res.body.safe_path.concern_points.should.be.a('array');
          res.body.safe_path.concern_points.length.should.equal(1);
          res.body.safe_path.concern_points[0].should.be.a('object');
          res.body.safe_path.concern_points[0].should.have.property('latitude');
          res.body.safe_path.concern_points[0].latitude.should.equal(12.34);
          res.body.safe_path.concern_points[0].should.have.property(
            'longitude',
          );
          res.body.safe_path.concern_points[0].longitude.should.equal(12.34);
          res.body.safe_path.concern_points[0].should.have.property('time');
          res.body.safe_path.concern_points[0].time.should.equal(1584924123);
          res.body.safe_path.should.have.property('info_website');
          res.body.safe_path.info_website.should.equal(
            'https://www.who.int/emergencies/diseases/novel-coronavirus-2019',
          );
          res.body.safe_path.should.have.property('publish_date');
          res.body.safe_path.publish_date.should.equal(1584924583);
          res.body.should.have.property('user_id');
          res.body.user_id.should.equal('a88309ca-26cd-4d2b-8923-af0779e423a3');
          done();
        });
    });
  });

  describe('POST /safe_paths with redacted trails', function () {
    before(async function () {
      await trails.deleteAllRows();
      let trail = [
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 1584924123,
        },
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 1584924456,
        },
      ];
      let identifier = 'a88309c1-26cd-4d2b-8923-af0779e423a3';
      await trails.insertRedactedTrailSet(
        trail,
        identifier,
        ORGANISATION_ID,
        USER_ID,
      );
    });

    after(async function () {
      await trails.deleteAllRows();
      await publications.deleteAllRows();
    });

    it('should accept safe path being submitted', function (done) {
      chai
        .request(server.app)
        .post('/safe_paths')
        .send({
          authority_name: 'Test Organization',
          publish_date: 1584924583,
          info_website:
            'https://www.who.int/emergencies/diseases/novel-coronavirus-2019',
          safe_path_json:
            'https://www.something.give/safe_path/a88309c2-26cd-4d2b-8923-af0779e423a3',
          start_date: 158494125,
          end_date: 1584924583,
          concern_points: [
            {
              time: 1584924123,
              latitude: 12.34,
              longitude: 12.34,
            },
            {
              time: 1584924456,
              latitude: 12.34,
              longitude: 12.34,
            },
          ],
        })
        .set('Authorization', `${ADMIN_JWT_TOKEN}`)
        .end(function (err, res) {
          res.should.have.status(200);
          res.should.be.json; // jshint ignore:line
          res.body.should.be.a('object');
          res.body.should.have.property('datetime_created');
          chai.assert.equal(
            new Date(res.body.datetime_created) instanceof Date,
            true,
          );
          res.body.should.have.property('organization_id');
          res.body.organization_id.should.equal(
            'a88309c2-26cd-4d2b-8923-af0779e423a3',
          );
          res.body.should.have.property('safe_path');
          res.body.safe_path.should.be.a('object');
          res.body.safe_path.should.have.property('authority_name');
          res.body.safe_path.authority_name.should.equal('Test Organization');
          res.body.safe_path.should.have.property('concern_points');
          res.body.safe_path.concern_points.should.be.a('array');
          res.body.safe_path.concern_points[0].should.be.a('object');
          res.body.safe_path.concern_points[0].should.have.property('latitude');
          res.body.safe_path.concern_points[0].latitude.should.equal(12.34);
          res.body.safe_path.concern_points[0].should.have.property(
            'longitude',
          );
          res.body.safe_path.concern_points[0].longitude.should.equal(12.34);
          res.body.safe_path.concern_points[0].should.have.property('time');
          res.body.safe_path.concern_points[0].time.should.equal(1584924123);
          res.body.safe_path.concern_points[1].should.have.property('latitude');
          res.body.safe_path.concern_points[1].latitude.should.equal(12.34);
          res.body.safe_path.concern_points[1].should.have.property(
            'longitude',
          );
          res.body.safe_path.concern_points[1].longitude.should.equal(12.34);
          res.body.safe_path.concern_points[1].should.have.property('time');
          res.body.safe_path.concern_points[1].time.should.equal(1584924456);
          res.body.safe_path.should.have.property('info_website');
          res.body.safe_path.info_website.should.equal(
            'https://www.who.int/emergencies/diseases/novel-coronavirus-2019',
          );
          res.body.safe_path.should.have.property('publish_date');
          res.body.safe_path.publish_date.should.equal(1584924583);
          res.body.should.have.property('user_id');
          res.body.user_id.should.equal('a88309ca-26cd-4d2b-8923-af0779e423a3');
          done();
        });
    });
  });

});
