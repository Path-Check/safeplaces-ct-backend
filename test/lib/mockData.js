const _ = require('lodash')
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const randomCoordinates = require('random-coordinates');
const sinon = require('sinon');

const organizationService = require('../../db/models/organizations');
const settingsService = require('../../db/models/settings');
const usersService = require('../../db/models/users');
const pointsService = require('../../db/models/points');
const publicationService = require('../../db/models/publications');
const casesService = require('../../db/models/cases');
const uploadService = require('../../db/models/upload');
const accessCodesService = require('../../db/models/accessCodes');

class MockData {

  /**
   * @method clearMockData
   *
   * Clear out Mock Data
   */
  async clearMockData() {
    await organizationService.deleteAllRows();
    await settingsService.deleteAllRows();
    await usersService.deleteAllRows();
    await pointsService.deleteAllRows();
    await publicationService.deleteAllRows();
    await casesService.deleteAllRows();
    sinon.restore();
  }

  /**
   * @method mockUser
   *
   * Generate Mock User
   */
  async mockUser(options = {}) {
    if (!options.username) throw new Error('Username must be provided');
    if (!options.password) throw new Error('Password must be provided');
    if (!options.organization_id) throw new Error('Organization ID must be provided');
    if (!options.email) throw new Error('Email must be provided');

    if (!process.env.SEED_MAPS_API_KEY) {
      throw new Error('Populate environment variable SEED_MAPS_API_KEY');
    }

    const password = await bcrypt.hash(options.password, 5);

    const params = {
      id: uuidv4(),
      organization_id: options.organization_id,
      username: options.username,
      password: password,
      email: options.email,
      is_admin: true,
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
    if (options.id) throw new Error('ID is not needed.');
    if (!options.name) throw new Error('Authority Name must be provided');
    if (!options.info_website_url) throw new Error('Info Website must be provided');

    const coords = randomCoordinates({ fixed: 5 }).split(',');

    let params = {
      info_website_url: 'https://www.wowza.com/',
      reference_website_url: 'https://reference.wowza.com/',
      api_endpoint_url: 'https://api.wowza.com/safe_paths/',
      region_coordinates: { latitude: coords[0], longitude: coords[1] }
    }

    const results = await organizationService.createOrganization(_.extend(params, options));
    if (results) {
      return results;
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
    if (!options.caseId) throw new Error('Case ID must be provided');

    let trails = this._generateTrailsData(numberOfTrails, timeIncrementInSeconds, options.startAt)
    let results = await pointsService.insertRedactedTrailSet(
      trails,
      options.caseId
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

  async mockCase(options = {}) {
    if (!options.organization_id) throw new Error('Organization ID must be provided.');
    if (!options.state) throw new Error('State must be provided.');

    const params = {
      state: options.state,
      organization_id: options.organization_id,
      external_id: options.external_id,
      expires_at: options.expires_at
    };

    const organization = await organizationService.fetchById(options.organization_id)
    if (organization) {
      if (!params.expires_at) params.expires_at = moment().startOf('day').add(organization.daysToRetainRecords, 'days').calendar();
      const result = await casesService.createCase(params);
      if (result) {
        return result;
      }
    }

    throw new Error('Problem adding the case.');
  }

  async mockCaseAndTrails(options = {}) {
    if (!options.organization_id) throw new Error('Organization ID must be provided.');
    if (!options.number_of_trails) throw new Error('Number of trails is invalid.');
    if (!options.seconds_apart) throw new Error('Seconds Apart is invalid.');
    if (!options.state) throw new Error('State is invalid.');

    let caseParams = {
      organization_id: options.organization_id,
      state: options.state,
      expires_at: options.expires_at
    };
    if (options.publishedOn) caseParams.state = 'published'

    let newCase = await this.mockCase(caseParams)
    newCase.points = [];

    // Add Points
    let trailsParams = {
      caseId: newCase.caseId
    }
    if (options.publishedOn) trailsParams.startAt = options.publishedOn
    const points = await this.mockTrails(options.number_of_trails, options.seconds_apart, trailsParams)
    if (points) {
      newCase.points = newCase.points.concat(points);
    }

    if (options.publishedOn) {
      const publicationParams = {
        organization_id: options.organization_id,
        publish_date: Math.floor(options.publishedOn / 1000)
      }
      const publication = await publicationService.insert(publicationParams);
      await casesService.updateCasePublicationId([newCase.caseId], publication.id);
    }

    return newCase
  }

  /**
   * Generate a mock access code
   *
   * @method mockAccessCode
   */
  async mockAccessCode() {
    const mockCode = {
      id: 1,
      value: await accessCodesService.generateValue(),
      valid: true,
    };

    try {
      sinon.restoreObject(accessCodesService);
    } catch (error) {
      // no-op
    }

    sinon.stub(accessCodesService, 'create').returns(mockCode);

    sinon.stub(accessCodesService, 'find').callsFake((query) => {
      if (query && (query.id === mockCode.id || query.value === mockCode.value)) {
        return mockCode;
      }
      return null;
    });

    return await accessCodesService.create();
  }

  /**
   * Generates mock upload points
   *
   * @method mockUploadPoints
   * @param {Number} num
   * @param {Number} timeIncrementInSeconds
   * @param {Object} options
   */
  async mockUploadPoints(accessCode, num) {
    if (!accessCode || !accessCode.id) throw new Error('Access code must be provided');

    const accessCodeId = accessCode.id;
    let points = this._generateUploadedPoints(accessCodeId, num);

    try {
      sinon.restoreObject(uploadService);
    } catch (error) {
      // no-op
    }

    sinon.stub(uploadService, 'create').returns(points);

    sinon.stub(uploadService, 'fetchPoints').callsFake((accessCode) => {
      if (accessCode && accessCode.id === accessCodeId) {
        return points;
      }
      return [];
    });

    sinon.stub(uploadService, 'deletePoints').callsFake((accessCode) => {
      if (accessCode && accessCode.id === accessCodeId) {
        points = [];
      }
    });

    return await uploadService.create(points);
  }

  // private

  _generateTrailsData(numberOfTrails, timeIncrementInSeconds, startAt = new Date().getTime()) {
    let coordTime = Math.floor(startAt / 1000);
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

  _generateUploadedPoints(accessCodeId, num) {
    const uploadId = uuidv4();
    return Array(num).fill("").map(() => {
      const coords = randomCoordinates({fixed: 5}).split(',');
      return {
        access_code_id: accessCodeId,
        upload_id: uploadId,
        coordinates: pointsService.makeCoordinate(parseFloat(coords[1]), parseFloat(coords[0])),
        time: uploadService.database.fn.now(),
        hash: "test",
      };
    });
  }
}

module.exports = new MockData();
