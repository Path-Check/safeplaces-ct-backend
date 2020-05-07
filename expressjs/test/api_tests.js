process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost/safeplaces_test';

const atob = require('atob');
var chai = require('chai');
var should = chai.should();
var chaiHttp = require('chai-http');
const jwtSecret = require('../config/jwtConfig');
const jwt = require('jsonwebtoken');
var server = require('../app');
var trails = require('../db/models/trails');
var publications = require('../db/models/publications');

const ORGANISATION_ID = 'a88309c2-26cd-4d2b-8923-af0779e423a3';
const USER_ID = 'a88309ca-26cd-4d2b-8923-af0779e423a3';
const USERNAME = 'admin';
const ADMIN_JWT_TOKEN = jwt.sign({ id: USERNAME }, jwtSecret.secret);

chai.use(chaiHttp);

describe('GET /health', function() {
  it('should return 200 and all ok message', function(done) {
    chai.request(server)
    .get('/health')
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json; // jshint ignore:line
      res.body.should.have.property('message');
      res.body.message.should.be.equal('All Ok!');
      done();
    });
  });
});

describe('GET /redacted_trails when DB is empty', function() {

  it('should return empty array for redacted trail', function(done) {
    chai.request(server)
    .get('/redacted_trails')
    .set('Authorization', `${ADMIN_JWT_TOKEN}`)
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json; // jshint ignore:line
      res.body.should.have.property('organization');
      res.body.organization.should.have.property('organization_id');
      res.body.organization.organization_id.should.equal('a88309c2-26cd-4d2b-8923-af0779e423a3');
      res.body.organization.should.have.property('authority_name');
      res.body.organization.authority_name.should.equal('Test Organization');
      res.body.organization.should.have.property('info_website');
      res.body.organization.info_website.should.equal(
        'https://www.who.int/emergencies/diseases/novel-coronavirus-2019');
      res.body.organization.should.have.property('safe_path_json');
      res.body.organization.safe_path_json.should.equal(
        'https://www.something.give/safe_path/a88309c2-26cd-4d2b-8923-af0779e423a3');
      res.body.should.have.property('data');
      res.body.data.should.be.a('array');
      res.body.data.should.be.empty;
      done();
    });
  });
});

describe('GET /redacted_trails with some values', function() {

  before(async function(){
    console.log('Seeding trail data');
    await trails.deleteTable().then(async () => {
      let trail = [
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 123456789
        },
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 123456789
        }
      ];
      let identifier = 'a88309c1-26cd-4d2b-8923-af0779e423a3';
      await trails.insertRedactedTrailSet(
          trail,
          identifier,
          ORGANISATION_ID,
          USER_ID
        ).then((redactedTrailRecords) => {});
    });
  });

  after(async function(){
    console.log('Deleting seeded trail data');
    await trails.deleteTable().then(() => {});
  });

  it('should return all redacted trails', function(done) {
    chai.request(server)
    .get('/redacted_trails')
    .set('Authorization', `${ADMIN_JWT_TOKEN}`)
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json; // jshint ignore:line
      res.body.should.have.property('organization');
      res.body.organization.should.have.property('organization_id');
      res.body.organization.organization_id.should.equal('a88309c2-26cd-4d2b-8923-af0779e423a3');
      res.body.organization.should.have.property('authority_name');
      res.body.organization.authority_name.should.equal('Test Organization');
      res.body.organization.should.have.property('info_website');
      res.body.organization.info_website.should.equal(
        'https://www.who.int/emergencies/diseases/novel-coronavirus-2019');
      res.body.organization.should.have.property('safe_path_json');
      res.body.organization.safe_path_json.should.equal(
        'https://www.something.give/safe_path/a88309c2-26cd-4d2b-8923-af0779e423a3');
      res.body.should.have.property('data');
      res.body.data.should.be.a('array');
      res.body.data[0].should.have.property('identifier');
      res.body.data[0].identifier.should.equal('a88309c1-26cd-4d2b-8923-af0779e423a3');
      res.body.data[0].should.have.property('organization_id');
      res.body.data[0].organization_id.should.equal('a88309c2-26cd-4d2b-8923-af0779e423a3');
      res.body.data[0].trail.should.be.a('array');
      res.body.data[0].trail[0].should.have.property('latitude');
      res.body.data[0].trail[0].latitude.should.equal(12.34);
      res.body.data[0].trail[0].should.have.property('longitude');
      res.body.data[0].trail[0].longitude.should.equal(12.34);
      res.body.data[0].trail[0].should.have.property('time');
      res.body.data[0].trail[0].time.should.equal(123456789);
      res.body.data[0].trail[1].should.have.property('latitude');
      res.body.data[0].trail[1].latitude.should.equal(12.34);
      res.body.data[0].trail[1].should.have.property('longitude');
      res.body.data[0].trail[1].longitude.should.equal(12.34);
      res.body.data[0].trail[1].should.have.property('time');
      res.body.data[0].trail[1].time.should.equal(123456789);
      res.body.data[0].should.have.property('user_id');
      done();
    });
  });
});

describe('POST /redacted_trail', function() {

  afterEach(async function(){
    console.log('Deleting posted trail data');
    await trails.deleteTable().then(() => {});
  });

  it('should check for right JWT token', function(done) {
    chai.request(server)
    .post('/redacted_trail')
    .send({
      'identifier': 'a88309c4-26cd-4d2b-8923-af0779e423a3',
      'trail': [
        {
          'time': 123456789,
          'latitude': 12.34,
          'longitude': 12.34
        }
      ]
    })
    .set('Authorization', `somebadtoken`)
    .end(function(err, res) {
      res.should.have.status(401);
      res.text.should.equal('Unauthorized');
      done();
    });
  });

  it('should fail when redacted trail is empty', function(done) {
    chai.request(server)
    .post('/redacted_trail')
    .send({
      'identifier': 'a88309c4-26cd-4d2b-8923-af0779e423a3',
      'trail': []
    })
    .set('Authorization', `${ADMIN_JWT_TOKEN}`)
    .end(function(err, res) {
      res.should.have.status(400);
      res.should.be.json; // jshint ignore:line
      res.body.should.have.property('message');
      res.body.message.should.equal('Trail can not be empty.');
      done();
    });
  });

  it('should accept redacted trail', function(done) {
    chai.request(server)
    .post('/redacted_trail')
    .send({
      'identifier': 'a88309c4-26cd-4d2b-8923-af0779e423a3',
      'trail': [
        {
          'time': 123456789,
          'latitude': 12.34,
          'longitude': 12.34
        }
      ]
    })
    .set('Authorization', `${ADMIN_JWT_TOKEN}`)
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json; // jshint ignore:line
      res.body.should.have.property('data');
      res.body.data.should.be.a('object');
      res.body.data.should.have.property('identifier');
      res.body.data.identifier.should.equal('a88309c4-26cd-4d2b-8923-af0779e423a3');
      res.body.data.should.have.property('organization_id');
      res.body.data.organization_id.should.equal('a88309c2-26cd-4d2b-8923-af0779e423a3');
      res.body.data.should.have.property('trail');
      res.body.data.trail.should.be.a('array');
      res.body.data.trail[0].should.be.a('object');
      res.body.data.trail[0].should.have.property('latitude');
      res.body.data.trail[0].latitude.should.equal(12.34);
      res.body.data.trail[0].should.have.property('longitude');
      res.body.data.trail[0].longitude.should.equal(12.34);
      res.body.data.trail[0].should.have.property('time');
      res.body.data.trail[0].time.should.equal(123456789);
      res.body.data.should.have.property('user_id');
      res.body.data.user_id.should.equal('a88309ca-26cd-4d2b-8923-af0779e423a3');
      res.body.should.have.property('success');
      res.body.success.should.equal(true);
      done();
    });
  });

  it('should accept multiple co-ordinates in redacted trail', function(done) {
    chai.request(server)
    .post('/redacted_trail')
    .send({
      'identifier': 'a88309c4-26cd-4d2b-8923-af0779e423a3',
      'trail': [
        {
          'time': 123456789,
          'latitude': 12.34,
          'longitude': 12.34
        },
        {
          'time': 123456790,
          'latitude': 12.34,
          'longitude': 12.34
        }
      ]
    })
    .set('Authorization', `${ADMIN_JWT_TOKEN}`)
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json; // jshint ignore:line
      res.body.should.have.property('data');
      res.body.data.should.be.a('object');
      res.body.data.should.have.property('identifier');
      res.body.data.identifier.should.equal('a88309c4-26cd-4d2b-8923-af0779e423a3');
      res.body.data.should.have.property('organization_id');
      res.body.data.organization_id.should.equal('a88309c2-26cd-4d2b-8923-af0779e423a3');
      res.body.data.should.have.property('trail');
      res.body.data.trail.should.be.a('array');
      res.body.data.trail[0].should.be.a('object');
      res.body.data.trail[0].should.have.property('latitude');
      res.body.data.trail[0].latitude.should.equal(12.34);
      res.body.data.trail[0].should.have.property('longitude');
      res.body.data.trail[0].longitude.should.equal(12.34);
      res.body.data.trail[0].should.have.property('time');
      res.body.data.trail[0].time.should.equal(123456789);
      res.body.data.trail[1].should.be.a('object');
      res.body.data.trail[1].should.have.property('latitude');
      res.body.data.trail[1].latitude.should.equal(12.34);
      res.body.data.trail[1].should.have.property('longitude');
      res.body.data.trail[1].longitude.should.equal(12.34);
      res.body.data.trail[1].should.have.property('time');
      res.body.data.trail[1].time.should.equal(123456790);
      res.body.data.should.have.property('user_id');
      res.body.data.user_id.should.equal('a88309ca-26cd-4d2b-8923-af0779e423a3');
      res.body.should.have.property('success');
      res.body.success.should.equal(true);
      done();
    });
  });
});

describe('GET /safe_path', function() {

  before(async function(){
    console.log('Seeding trail data');
    await trails.deleteTable().then(async () => {
      let trail = [
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 1584924123
        },
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 1584924456
        }
      ]
      let identifier = 'a88309c1-26cd-4d2b-8923-af0779e423a3';
      await trails.insertRedactedTrailSet(
          trail,
          identifier,
          ORGANISATION_ID,
          USER_ID
        ).then((redactedTrailRecords) => {});
    });
    console.log('Seeding publication data');
    await publications.deleteTable().then(async() => {
      let publication = {
        organization_id: ORGANISATION_ID,
        user_id: USER_ID,
        start_date: 158494125,
        end_date: 1584924583,
        publish_date: 1584924583
      };
      await publications.insert(publication).then((publicationRecords) => {});
    });
  });

  after(async function(){
    console.log('Deleting seeded trail data');
    await trails.deleteTable().then(() => {});
    console.log('Deleting seeded publication data');
    await publications.deleteTable().then(() => {});
  });

  it('should return an organization`s safe paths', function(done) {
    chai.request(server)
    .get('/safe_path/a88309c2-26cd-4d2b-8923-af0779e423a3')
    .end(function(err, res) {
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
      res.body.info_website.should.equal('https://www.who.int/emergencies/diseases/novel-coronavirus-2019');
      res.body.should.have.property('publish_date');
      res.body.publish_date.should.equal(1584924583);
      done();
    });
  });
});

describe('POST /safe_paths', function() {

  before(async function(){
    console.log('Seeding trail data');
    await trails.deleteTable().then(async () => {
      let trail = [
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 1584924123
        },
        {
          longitude: 12.34,
          latitude: 12.34,
          time: 1584924456
        }
      ]
      let identifier = 'a88309c1-26cd-4d2b-8923-af0779e423a3';
      await trails.insertRedactedTrailSet(
          trail,
          identifier,
          ORGANISATION_ID,
          USER_ID
        ).then((redactedTrailRecords) => {});
    });
  });

 after(async function(){
    console.log('Deleting seeded trail data');
    await trails.deleteTable().then(() => {});
    console.log('Deleting seeded publication data');
    await publications.deleteTable().then(() => {});
  });

  it('should accept safe path being submitted', function(done) {
    chai.request(server)
    .post('/safe_paths')
    .send({
      'authority_name':  'Test Organization',
      'publish_date': 1584924583,
      'info_website': 'https://www.who.int/emergencies/diseases/novel-coronavirus-2019',
      'safe_path_json': 'https://www.something.give/safe_path/a88309c2-26cd-4d2b-8923-af0779e423a3',
      'start_date': 158494125,
      'end_date': 1584924583,
      'concern_points':
      [
        {
          'time': 1584924123,
          'latitude': 12.34,
          'longitude': 12.34
        },
        {
          'time': 1584924456,
          'latitude': 12.34,
          'longitude': 12.34
        }
      ]
    })
    .set('Authorization', `${ADMIN_JWT_TOKEN}`)
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json; // jshint ignore:line
      res.body.should.be.a('object');
      res.body.should.have.property('datetime_created');
      chai.assert.equal(new Date(res.body.datetime_created) instanceof Date, true);
      res.body.should.have.property('organization_id');
      res.body.organization_id.should.equal('a88309c2-26cd-4d2b-8923-af0779e423a3');
      res.body.should.have.property('safe_path');
      res.body.safe_path.should.be.a('object');
      res.body.safe_path.should.have.property('authority_name');
      res.body.safe_path.authority_name.should.equal('Test Organization');
      res.body.safe_path.should.have.property('concern_points');
      res.body.safe_path.concern_points.should.be.a('array');
      res.body.safe_path.concern_points[0].should.be.a('object');
      res.body.safe_path.concern_points[0].should.have.property('latitude');
      res.body.safe_path.concern_points[0].latitude.should.equal(12.34);
      res.body.safe_path.concern_points[0].should.have.property('longitude');
      res.body.safe_path.concern_points[0].longitude.should.equal(12.34);
      res.body.safe_path.concern_points[0].should.have.property('time');
      res.body.safe_path.concern_points[0].time.should.equal(1584924123);
      res.body.safe_path.concern_points[1].should.have.property('latitude');
      res.body.safe_path.concern_points[1].latitude.should.equal(12.34);
      res.body.safe_path.concern_points[1].should.have.property('longitude');
      res.body.safe_path.concern_points[1].longitude.should.equal(12.34);
      res.body.safe_path.concern_points[1].should.have.property('time');
      res.body.safe_path.concern_points[1].time.should.equal(1584924456);
      res.body.safe_path.should.have.property('info_website');
      res.body.safe_path.info_website.should.equal('https://www.who.int/emergencies/diseases/novel-coronavirus-2019');
      res.body.safe_path.should.have.property('publish_date');
      res.body.safe_path.publish_date.should.equal(1584924583);
      res.body.should.have.property('user_id');
      res.body.user_id.should.equal('a88309ca-26cd-4d2b-8923-af0779e423a3');
      done();
    })
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
      res.body.maps_api_key.should.equal(process.env.SEED_MAPS_API_KEY);
      done();
    });
  });

  it('should fail when wrong password is given saying creds are invalid', function(done) {
    chai.request(server)
    .post('/login')
    .send({
      username: 'admin',
      password : 'wrongpassword'
    })
    .end(function(err, res) {
      res.should.have.status(401);
      res.should.be.json; // jshint ignore:line
      res.body.should.have.property('message');
      res.body.message.should.equal('Invalid credentials.');
      done();
    });
  });

  it('should fail with invalid username saying creds are invalid', function(done) {
    chai.request(server)
    .post('/login')
    .send({
      username: 'invaliduser',
      password : 'somepassword'
    })
    .end(function(err, res) {
      res.should.have.status(401);
      res.should.be.json; // jshint ignore:line
      res.body.should.have.property('message');
      res.body.message.should.equal('Invalid credentials.');
      done();
    });
  });
});
