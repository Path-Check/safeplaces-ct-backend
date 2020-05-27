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
    if (!organization.api_endpoint_url) throw new Error('Your API endpoint is invalid.') 

    let endpoint = organization.api_endpoint_url
    if (endpoint.substr((endpoint.length - 1), 1) !== '/') {
      endpoint = '/'
    }
    this._apiEndpointPage = `${endpoint}[PAGE].json`;

    const trailsChunked = this._chunkTrails(trails, organization.chunking_in_seconds)
    const cursor = this._getCursorInformation(organization, trailsChunked)
    const files = trailsChunked.map(chunk => {
      return {
        name: organization.name,
        publish_date_utc: (record.publish_date.getTime() / 1000),
        info_website_url: organization.info_website_url,
        notification_threshold_percent: organization.notification_threshold_percent,
        notification_threshold_count: organization.notification_threshold_count,
        concern_point_hashes: this._getPointHashes(chunk),
        page_name: this._apiEndpointPage.replace('[PAGE]', `${chunk.startTimestamp}_${chunk.endTimestamp}`)
      };
    })

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
  // 
  async buildAndZip(organization, record, trails) {
    const pages = await this.build(organization, record, trails)
    if (pages) {
      const zip = new AdmZip();
  
      let filename;
      zip.addFile("instructions.txt", "Place all files in the `trails` folder onto your web server.");
      zip.addFile('trails/', Buffer.from(''));
      zip.addFile(`trails/cursor.json`, Buffer.from(JSON.stringify(pages.cursor)));
      pages.files.forEach(page => {
        filename = page.page_name.split('/').pop();
        zip.addFile(`trails/${filename}`, Buffer.from(JSON.stringify(page)));
      });

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
 _getCursorInformation(organization, trails) {
    return trails.map(chunk => {
      return {
        id: `${chunk.startTimestamp}_${chunk.endTimestamp}`,
        startTimestamp: chunk.startTimestamp,
        endTimestamp: chunk.endTimestamp,
        filename: this._apiEndpointPage.replace('[PAGE]', `${chunk.startTimestamp}_${chunk.endTimestamp}`)
      }
    })
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