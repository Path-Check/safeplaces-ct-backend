const _ = require('lodash')
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const randomCoordinates = require('random-coordinates');

const usersService = require('../../db/models/users');
const organizationService = require('../../db/models/organizations');
const trailsService = require('../../db/models/trails');
const publicationService = require('../../db/models/publications');
const casesService = require('../../db/models/cases');


class MockData {

  /**
   * @method mockUser
   *
   * Generate Mock User
   */
  async mockUser(options = {}) {
    if (!options.username) throw new Error('Username must be provided');
    if (!options.password) throw new Error('Password must be provided');
    if (!options.organization) throw new Error('Organization must be provided');
    if (!options.email) throw new Error('Email must be provided');

    if (!process.env.SEED_MAPS_API_KEY) {
      throw new Error('Populate environment variable SEED_MAPS_API_KEY');
    }

    const password = await bcrypt.hash(options.password, 5);

    const params = {
      id: uuidv4(),
      organization_id: options.organization,
      username: options.username,
      password: password,
      email: options.password,
      maps_api_key: process.env.SEED_MAPS_API_KEY,
    };

    const results = await usersService.create(params);
    if (results) {
      return results[0];
    }
    throw new Error('Problem adding the organization.');
  }

  /**
   * @method mockOrganization
   *
   * Generate Mock Organization
   */
  async mockOrganization(options = {}) {
    if (!options.authority_name) throw new Error('Authority Name must be provided');
    if (!options.info_website) throw new Error('Info Website must be provided');

    const coords = randomCoordinates({ fixed: 5 }).split(',');

    let params = {
      id: uuidv4(),
      informationWebsiteUrl: 'https://www.wowza.com/',
      referenceWebsiteURL: 'https://reference.wowza.com/',
      apiEndpoint: 'https://api.wowza.com/safe_paths/',
      regionCoordinates: { latitude: coords[0], longitude: coords[1] }
    }

    const results = await organizationService.create(_.extend(params, options));
    if (results) {
      return results[0];
    }
    throw new Error('Problem adding the organization.');
  }

  /**
   * Generate Mock Trails
   *
   * User primarily for testing volume of records.
   *
   * @method mockTrails
   * @param {Number} numberOfTrails
   * @param {Number} timeIncrementInSeconds
   * @param {Object} options
   */
  async mockTrails(numberOfTrails, timeIncrementInSeconds, options = {}) {
    if (!numberOfTrails) throw new Error('Number of Trails must be provided');
    if (!timeIncrementInSeconds) throw new Error('Info Website must be provided');
    if (!options.redactedTrailId) throw new Error('Redacted Trail ID must be provided');
    if (!options.organizationId) throw new Error('Organization ID must be provided');
    if (!options.userId) throw new Error('User ID must be provided');

    let trails = this._generateTrailsData(numberOfTrails, timeIncrementInSeconds)

    let results = await trailsService.insertRedactedTrailSet(
      trails,
      options.redactedTrailId,
      options.organizationId,
      options.userId,
    );
    if (results) {
      return results;
    }
    throw new Error('Problem adding the trails.');
  }

  /**
   * @method mockPublication
   *
   * Generate Mock Publication
   */
  async mockPublication(options = {}) {
    if (!options.organization_id) throw new Error('Organization ID must be provided');
    if (!options.user_id) throw new Error('User ID must be provided');
    if (!options.start_date) throw new Error('Start Date must be provided');
    if (!options.end_date) throw new Error('End Date must be provided');

    let params = {
      publish_date: Math.floor(new Date().getTime() / 1000)
    }

    const results = await publicationService.insert(_.extend(params, options));
    if (results) {
      return results;
    }
    throw new Error('Problem adding the publication.');
  }

  // private

  _generateTrailsData(numberOfTrails, timeIncrementInSeconds) {
    let coordTime = Math.floor(new Date().getTime() / 1000);
    return Array(numberOfTrails).fill("").map(() => {
      coordTime = coordTime - timeIncrementInSeconds;
      const coords = randomCoordinates({fixed: 5}).split(',');
      return {
        longitude: parseFloat(coords[1]),
        latitude: parseFloat(coords[0]),
        time: coordTime
      };
    })
  }

  async mockCase(options = {}) {
    if (!options.state) throw new Error('State must be provided.');

    const params = {
      id: uuidv4(),
      state: options.state,
    };

    const results = await casesService.create(params);
    if (results) {
      return results[0];
    }
    throw new Error('Problem adding the case.');
  }
}

module.exports = new MockData();
