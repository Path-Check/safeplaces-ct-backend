const AdmZip = require('adm-zip');

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
  build(organization, record, trails) {

    if (!organization.apiEndpoint) throw new Error('Your API endpoint is invalid.') 

    let endpoint = organization.apiEndpoint
    if (endpoint.substr((endpoint.length - 1), 1) !== '/') {
      endpoint = '/'
    }
    this._apiEndpointPage = `${endpoint}[PAGE].json`;

    const trailsChunked = this._chunkTrails(trails, organization.chunkingInSeconds)

    return trailsChunked.map((chunk, key) => {
      return {
        authority_name: organization.authority_name,
        publish_date_utc: (record.publish_date.getTime() / 1000),
        info_website: organization.info_website,
        notification_threshold_percent: organization.notificationThresholdPercent,
        notification_threshold_count: organization.notificationThresholdCount,
        concern_point_hashes: this._getPointHashes(chunk),
        pages: this._getPaginationInformation(organization, trailsChunked, (key + 1))
      };
    });
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
  // 
  async buildAndZip(organization, record, trails) {
    const pages = await this.build(organization, record, trails)
    if (pages) {
      const zip = new AdmZip();
  
      zip.addFile("instructions.txt", "Place all files in the `trails` folder onto your web server.");
      zip.addFile('trails/', Buffer.from(''));
      pages.forEach((page, key) => zip.addFile(`trails/${record.id}_${(key + 1)}.json`, Buffer.from(JSON.stringify(page))));

      return zip.toBuffer();
    }
    throw new Error('Problem generating the zip file.')
  }

  // private

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
  _getPaginationInformation(organization, trails, currentPage) {
    return {
      chunkingInSeconds: organization.chunkingInSeconds,
      totalPages: trails.length,
      currentPage,
      endpoints: Array.from(Array(trails.length).keys()).map(page => this._apiEndpointPage.replace('[PAGE]', (page + 1)))
    }
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
   * Get all hashes related to this page.
   *
   * @private
   * @method _chunkTrails
   * @param {Array} trails
   * @param {Number} seconds
   * @return {Array}
   */
  _chunkTrails(trails, seconds) {
    const sortedTrails = trails.sort((a,b) => (a.time > b.time) ? 1 : ((b.time > a.time) ? -1 : 0)); // Assure they are sorted properly.

    if (trails.length === 0) {
      return [
        {
          page: 1,
          startTimestamp: null,
          endTimestamp: null,
          trails: []
        }
      ]
    }

    let i = 0
    let groups = []
    let timeGroup = sortedTrails[0].time
    while(timeGroup <= sortedTrails[(sortedTrails.length - 1)].time) {
      groups.push({
        page: (i + 1),
        startTimestamp: timeGroup,
        endTimestamp: (timeGroup + (seconds - 1)),
        trails: []
      })
      timeGroup += seconds
      i++
    }

    return groups.map(group => {
      group.trails = sortedTrails.filter(trail => (trail.time >= group.startTimestamp && trail.time <= group.endTimestamp))
      return group
    }).filter(group => group.trails.length > 0)
  }

}

module.exports = new PublicationFiles()