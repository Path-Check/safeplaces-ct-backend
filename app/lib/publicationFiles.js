const _ = require('lodash');
const AdmZip = require('adm-zip');
const geoHash = require('./geoHash');
const transform = require('./pocTransform.js');

/**
 * @class PublicationFiles
 *
 * Using trails data, generate a set of JSON files the HA can point to.
 *
 */

class PublicationFiles {
  /**
   * Build Publication File Content
   *
   * @method build
   * @param {Object} organization
   * @param {Object} record
   * @param {Array[Trails]} trails
   * @return {Object}
   */
  async build(organization, record, trails) {
    if (!organization.apiEndpointUrl)
      throw new Error('Your API endpoint is invalid.');

    let endpoint = organization.apiEndpointUrl;
    if (endpoint.substr(endpoint.length - 1, 1) !== '/') {
      endpoint = '/';
    }
    this._apiEndpointPage = `${endpoint}[PAGE].json`;

    trails = await this._transformAndHash(trails);

    const header = this._getHeader(organization, record);
    const trailsChunked = this._chunkTrails(
      trails,
      organization.chunkingInSeconds,
    );
    const cursor = this._getCursorInformation(
      organization,
      trailsChunked,
      _.clone(header),
    );
    const files = trailsChunked.map(chunk => {
      const newHeader = _.clone(header);
      newHeader.concern_point_hashes = this._getPointHashes(chunk);
      newHeader.page_name = this._apiEndpointPage.replace(
        '[PAGE]',
        `${chunk.startTimestamp}_${chunk.endTimestamp}`,
      );
      return newHeader;
    });

    return { files, cursor };
  }

  /**
   *
   * Build Publication File Content and return zip file Buffer.
   *
   * @method build
   * @param {Object} organization
   * @param {Object} record
   * @param {Array[Trails]} trails
   * @return {<Promise>ZipFile}
   */

  async buildAndZip(organization, record, trails) {
    const pages = await this.build(organization, record, trails);
    if (pages) {
      const zip = new AdmZip();

      let filename;
      zip.addFile(
        'instructions.txt',
        'Place all files in the `trails` folder onto your web server.',
      );
      zip.addFile('trails/', Buffer.from(''));
      zip.addFile(
        `trails/cursor.json`,
        Buffer.from(JSON.stringify(pages.cursor)),
      );
      pages.files.forEach(page => {
        filename = page.page_name.split('/').pop();
        zip.addFile(`trails/${filename}`, Buffer.from(JSON.stringify(page)));
      });

      return zip.toBuffer();
    }
    throw new Error('Problem generating the zip file.');
  }

  // private

  /**
   *
   * Fetch Header
   *
   * @method _getHeader
   * @param {Object} organization
   * @param {Object} record
   * @return {Object}
   */

  _getHeader(organization, record) {
    return {
      version: '1.0',
      name: organization.name,
      publish_date_utc: record.publish_date.getTime() / 1000,
      info_website_url: organization.infoWebsiteUrl,
      api_endpoint_url: organization.apiEndpointUrl,
      privacy_policy_url: organization.privacyPolicyUrl,
      reference_website_url: organization.referenceWebsiteUrl,
      notification_threshold_percent: organization.notificationThresholdPercent,
      notification_threshold_count: organization.notificationThresholdCount,
    };
  }

  /**
   *
   * Transform from duration to discreet and build hashes.
   *
   * @method _transformAndHash
   * @param {Array[Trails]} trails
   * @return {Array[HashedTrails]}
   */

  async _transformAndHash(trails) {
    trails = transform.durationToDiscreet(trails);

    let trail, hash;
    let trailRecords = [];

    for (trail of trails) {
      hash = await geoHash.encrypt(trail);
      if (hash) {
        trail.hash = hash.encodedString;
        trailRecords.push(trail);
      }
    }

    return trailRecords;
  }

  /**
   * Get all information related to paginating.
   *
   * @private
   * @method _getPaginationInformation
   * @param {Object} organization
   * @param {Array} trails
   * @param {Number} currentPage
   * @return {Object}
   */
  _getCursorInformation(organization, trails, header) {
    const pages = trails.map(chunk => {
      return {
        id: `${chunk.startTimestamp}_${chunk.endTimestamp}`,
        startTimestamp: chunk.startTimestamp,
        endTimestamp: chunk.endTimestamp,
        filename: this._apiEndpointPage.replace(
          '[PAGE]',
          `${chunk.startTimestamp}_${chunk.endTimestamp}`,
        ),
      };
    });
    header.pages = pages;
    return header;
  }

  /**
   * Get all hashes related to this page.
   *
   * @private
   * @method _getPointHashes
   * @param {Object} chunk
   * @return {Array}
   */
  _getPointHashes(chunk) {
    return chunk.trails.map(trail => trail.hash);
  }

  /**
   * Build pages based on chunking time.
   * Remember, the time we are looking at is the Published time for the case, not the time
   * of the point.
   *
   * @private
   * @method _chunkTrails
   * @param {Array} trails
   * @param {Number} seconds
   * @return {Array}
   */
  _chunkTrails(trails, seconds) {
    if (trails.length === 0) {
      return [
        {
          page: 1,
          startTimestamp: null,
          endTimestamp: null,
          trails: [],
        },
      ];
    }

    const shuffle = array => {
      let currentIndex = array.length;
      let temporaryValue, randomIndex;
      while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }
      return array;
    };

    // Get Publication dates, and sort them.
    let publicationDates = [
      ...new Set(trails.map(trail => new Date(trail.publish_date).getTime())),
    ];
    publicationDates = publicationDates
      .sort((a, b) => (a.time > b.time ? 1 : b.time > a.time ? -1 : 0))
      .reverse(); // Assure they are sorted properly.

    // Goto 1 second before Midnight of the most recent publication
    let startTime =
      new Date(publicationDates[0]).setHours(0, 0, 0, 0) + 86400000 - 1000;
    let lastPublicationTimestamp =
      publicationDates[publicationDates.length - 1];

    // Work backwards baseed on the chunking time.
    let endTimestamp;
    let i = 0;
    let groups = [];
    let timeGroup = startTime;
    while (startTime) {
      endTimestamp = timeGroup - seconds * 1000 + 1000;
      groups.push({
        page: i + 1,
        startTimestamp: timeGroup,
        endTimestamp: endTimestamp,
        trails: [],
      });
      timeGroup = timeGroup - seconds * 1000;
      i++;

      if (lastPublicationTimestamp >= endTimestamp) break;
    }

    // Find Trails. We are checking the publish time of the publication that is associated with the
    // case and therefore the trail.
    // Remove any empty groups that don't have any trails associated with them.
    groups = groups
      .map(group => {
        group.trails = trails.filter(trail => {
          const publishDateTs = new Date(trail.publish_date).getTime();
          if (
            publishDateTs <= group.startTimestamp &&
            publishDateTs >= group.endTimestamp
          ) {
            return true;
          }
          return false;
        });
        return group;
      })
      .filter(group => group.trails.length > 0);

    // Sort all trails by time for privacy.
    return groups.map(group => {
      group.trails = shuffle(group.trails);
      return group;
    });
  }
}

module.exports = new PublicationFiles();
