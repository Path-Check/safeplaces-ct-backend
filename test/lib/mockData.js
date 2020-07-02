const {
  accessCodeService,
  caseService,
  organizationService,
  pointService,
  publicationService,
  publicOrganizationService,
  settingService,
  uploadService,
  userService,
} = require('../../app/lib/db');

const _ = require('lodash');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const randomCoordinates = require('random-coordinates');
const sinon = require('sinon');

class MockData {
  /**
   * @method clearMockData
   *
   * Clear out Mock Data
   */
  async clearMockData() {
    await organizationService.deleteAllRows();
    await settingService.deleteAllRows();
    await userService.deleteAllRows();
    await pointService.deleteAllRows();
    await publicationService.deleteAllRows();
    await caseService.deleteAllRows();
    sinon.restore();
  }

  /**
   * @method mockUser
   *
   * Generate Mock User
   */
  async mockUser(options = {}) {
    if (!options.username) throw new Error('Username must be provided');
    if (!options.organization_id)
      throw new Error('Organization ID must be provided');

    if (!process.env.SEED_MAPS_API_KEY) {
      throw new Error('Populate environment variable SEED_MAPS_API_KEY');
    }

    const params = {
      id: uuidv4(),
      idm_id: uuidv4(),
      organization_id: options.organization_id,
      username: options.username,
      is_admin: true,
      maps_api_key: process.env.SEED_MAPS_API_KEY,
    };

    const results = await userService.create(params);
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

    const coords = randomCoordinates({ fixed: 5 }).split(',');

    const org = _.extend(
      {
        reference_website_url: 'https://reference.wowza.com/',
        api_endpoint_url: 'https://api.wowza.com/safe_paths/',
        privacy_policy_url: 'https://privacy.wowza.com/safe_paths/',
        region_coordinates: { latitude: coords[0], longitude: coords[1] },
      },
      options,
    );

    let publicOrg = {};

    try {
      sinon.restoreObject(publicOrganizationService);
    } catch (error) {
      // no-op
    }

    sinon.stub(publicOrganizationService, 'create').callsFake(params => {
      publicOrg = params;
      return publicOrg;
    });

    sinon
      .stub(publicOrganizationService, 'updateOne')
      .callsFake((id, params) => {
        if (id === publicOrg.id) {
          publicOrg = params;
        }
        return publicOrg;
      });

    const results = await organizationService.createOrganization(org);

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
    if (!timeIncrementInSeconds)
      throw new Error('Info Website must be provided');
    if (!options.caseId) throw new Error('Case ID must be provided');

    let trails = this._generateTrailsData(
      numberOfTrails,
      timeIncrementInSeconds,
      options.startAt,
    );
    let results = await pointService.insertRedactedTrailSet(
      trails,
      options.caseId,
    );
    if (results) {
      return results;
    }
    throw new Error('Problem adding the trails.');
  }

  /**
   * Generate Mock Trails for Load Test
   *
   * Pass in the case id and the pre generated trails.
   *
   * @method mockTrailsLoadTest
   * @param {String} startTime
   * @param {Object} options
   * @param {Number} options.startTime
   * @param {Number} options.organization_id
   * @param {Number} options.organization_id
   */
  async mockTrailsLoadTest(options = {}) {
    if (!options.startTime) throw new Error('Start Time must be provided');
    if (!options.organization_id)
      throw new Error('Organization ID must be provided');
    if (!options.numberOfRecords)
      throw new Error('Number of Records must be provided');

    const caseParams = {
      organization_id: options.organization_id,
      state: options.state || 'unpublished',
    };
    let pointsCase = await this.mockCase(caseParams);
    if (pointsCase) {
      const trails = this._generateTrailsData(
        options.numberOfRecords,
        300,
        options.startTime,
        true,
      );
      const results = await pointService.loadTestRedactedTrails(
        trails,
        pointsCase.caseId,
      );
      if (results) {
        return results;
      }
    }
    throw new Error('Problem adding the trails.');
  }

  /**
   * Generate Mock Trails Directly from Data
   *
   * Pass in the case id and the pre generated trails.
   *
   * @method mockTrailsDirect
   * @param {String} startTime
   * @param {Object} options
   * @param {Number} options.caseId
   */
  async mockTrailsDirect(options = {}) {
    if (!options.startTime) throw new Error('Start Time must be provided');
    if (!options.organization_id)
      throw new Error('Organization ID must be provided');

    const caseParams = {
      organization_id: options.organization_id,
      state: options.state || 'unpublished',
    };
    let pointsCase = await this.mockCase(caseParams);
    if (pointsCase) {
      const trails = this._generateLargeGroupingOfPoints(options.startTime);
      const results = await pointService.insertRedactedTrailSet(
        trails,
        pointsCase.caseId,
      );
      if (results) {
        return results;
      }
    }
    throw new Error('Problem adding the trails.');
  }

  /**
   * @method mockPublication
   *
   * Generate Mock Publication
   */
  async mockPublication(options = {}) {
    if (!options.organization_id)
      throw new Error('Organization ID must be provided');
    if (!options.start_date) throw new Error('Start Date must be provided');
    if (!options.end_date) throw new Error('End Date must be provided');

    let params = {
      publish_date: Math.floor(new Date().getTime() / 1000),
    };

    const results = await publicationService.insert(_.extend(params, options));
    if (results) {
      return results;
    }
    throw new Error('Problem adding the publication.');
  }

  async mockCase(options = {}) {
    if (!options.organization_id)
      throw new Error('Organization ID must be provided.');
    if (!options.state) throw new Error('State must be provided.');

    const params = {
      state: options.state,
      organization_id: options.organization_id,
      external_id: options.external_id,
      expires_at: options.expires_at,
    };

    const organization = await organizationService.fetchById(
      options.organization_id,
    );
    if (organization) {
      if (!params.expires_at)
        params.expires_at = moment()
          .startOf('day')
          .add(organization.daysToRetainRecords, 'days')
          .format();
      const result = await caseService.createCase(params);
      if (result) {
        return result;
      }
    }

    throw new Error('Problem adding the case.');
  }

  async mockCaseAndTrails(options = {}) {
    if (!options.organization_id)
      throw new Error('Organization ID must be provided.');
    if (!options.number_of_trails)
      throw new Error('Number of trails is invalid.');
    if (!options.seconds_apart) throw new Error('Seconds Apart is invalid.');
    if (!options.state) throw new Error('State is invalid.');

    let caseParams = {
      organization_id: options.organization_id,
      state: options.state,
      expires_at: options.expires_at,
    };
    if (options.publishedOn) caseParams.state = 'published';

    let newCase = await this.mockCase(caseParams);
    newCase.points = [];

    // Add Points
    let trailsParams = {
      caseId: newCase.caseId,
    };
    if (options.publishedOn) trailsParams.startAt = options.publishedOn;
    const points = await this.mockTrails(
      options.number_of_trails,
      options.seconds_apart,
      trailsParams,
    );
    if (points) {
      newCase.points = newCase.points.concat(points);
    }

    if (options.publishedOn) {
      const publicationParams = {
        organization_id: options.organization_id,
        publish_date: Math.floor(options.publishedOn / 1000),
      };
      const publication = await publicationService.insert(publicationParams);
      await caseService.updateCasePublicationId(
        [newCase.caseId],
        publication.id,
      );
    }

    return newCase;
  }

  /**
   * Generate a mock access code
   *
   * @method mockAccessCode
   */
  async mockAccessCode() {
    const mockCode = {
      id: 1,
      value: await accessCodeService.generateValue(),
      valid: true,
    };

    try {
      sinon.restoreObject(accessCodeService);
    } catch (error) {
      // no-opconsole.log(error)
    }

    sinon.stub(accessCodeService, 'create').returns(mockCode);

    sinon.stub(accessCodeService, 'find').callsFake(query => {
      if (
        query &&
        (query.id === mockCode.id || query.value === mockCode.value)
      ) {
        return mockCode;
      }
      return null;
    });

    return await accessCodeService.create();
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
    if (!accessCode || !accessCode.id)
      throw new Error('Access code must be provided');

    const accessCodeId = accessCode.id;
    let points = await this._generateUploadedPoints(accessCodeId, num);

    try {
      sinon.restoreObject(uploadService);
    } catch (error) {
      // no-op
    }

    sinon.stub(uploadService, 'create').returns(points);

    sinon.stub(uploadService, 'fetchPoints').callsFake(accessCode => {
      if (accessCode && accessCode.id === accessCodeId) {
        return points;
      }
      return [];
    });

    sinon.stub(uploadService, 'deletePoints').callsFake(accessCode => {
      if (accessCode && accessCode.id === accessCodeId) {
        points = [];
      }
    });

    return await uploadService.create(points);
  }

  // private

  _getRandomCoordinates() {
    const coords = randomCoordinates({ fixed: 5 }).split(',');
    return {
      longitude: parseFloat(coords[1]),
      latitude: parseFloat(coords[0]),
    };
  }

  _generateLargeGroupingOfPoints(startTime) {
    let final = [];

    const groupOne = this._generateGroupedTrailsData(
      this._getRandomCoordinates(),
      startTime,
      25,
    );
    final = final.concat(groupOne);

    // Start 5 minutes after the last trail point and add 100 random points in 5 min increments
    const randomTrails = this._generateTrailsData(
      100,
      300,
      groupOne[4].time + 300000,
      false,
    );
    final = final.concat(randomTrails);

    // Create another grouping for 45 min
    const groupTwo = this._generateGroupedTrailsData(
      this._getRandomCoordinates(),
      randomTrails[99].time + 300000,
      45,
    );
    final = final.concat(groupTwo);

    // Start 5 minutes after the last trail point and add 250 random points in 5 min increments
    const randomTrailsTwo = this._generateTrailsData(
      250,
      300,
      groupTwo[4].time + 300000,
      false,
    );
    final = final.concat(randomTrailsTwo);

    // Create another grouping for 15 min
    const groupThree = this._generateGroupedTrailsData(
      this._getRandomCoordinates(),
      randomTrailsTwo[99].time + 300000,
      15,
    );
    final = final.concat(groupThree);

    return final;
  }

  _generateGroupedTrailsData(coordinates, startTime, duration) {
    const standardIncrement = 5;
    const numberOfTrails = duration / standardIncrement;
    let coordTime = startTime;
    return Array(numberOfTrails)
      .fill('')
      .map(() => {
        coordTime = coordTime + standardIncrement * 60 * 1000;
        return {
          longitude: coordinates.longitude,
          latitude: coordinates.latitude,
          time: coordTime,
        };
      });
  }

  _generateTrailsData(
    numberOfTrails,
    timeIncrementInSeconds,
    startAt = new Date().getTime(),
    decrementTime = true,
  ) {
    let coordTime = Math.floor(startAt / 1000);
    return Array(numberOfTrails)
      .fill('')
      .map(() => {
        if (decrementTime) {
          coordTime = coordTime - timeIncrementInSeconds;
        } else {
          coordTime = coordTime + timeIncrementInSeconds;
        }
        const coords = randomCoordinates({ fixed: 5 }).split(',');
        return {
          longitude: parseFloat(coords[1]),
          latitude: parseFloat(coords[0]),
          time: coordTime,
        };
      });
  }

  /* eslint-disable */
  async _generateUploadedPoints(accessCodeId, num) {
    const uploadId = uuidv4();

    let final = [];
    let i;
    for (i of Array(num).fill('')) {
      const coords = randomCoordinates({ fixed: 5 }).split(',');
      const dbData = await pointService.fetchTestHash(
        parseFloat(coords[1]),
        parseFloat(coords[0]),
      );
      const entry = {
        access_code_id: accessCodeId,
        upload_id: uploadId,
        coordinates: dbData.point,
        time: dbData.time,
      };
      final.push(entry);
    }
    return final;
  }
  /* eslint-enable */
}

module.exports = new MockData();
