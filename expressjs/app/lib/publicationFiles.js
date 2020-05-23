const _ = require('lodash')

/**
 * @class PublicationFiles
 *
 * Using trails data, generate a set of JSON files the HA can point to.
 *
 */

class PublicationFiles {

/**
 * Add Product to order
 *
 * @method build
 * @param {Object} organization
 * @param {Object} record
 * @param {Array[Trails]} trails
 * @return {Object}
 */
  build(organization, record, trails) {

    this._apiEndpoint = `${organization.apiEndpoint}${record.id}_[PAGE].json`

    const trailsChunked = this._chunkTrails(trails, organization.chunkingInSeconds)

    const currentPage = 1

    return {
      authority_name: organization.authority_name,
      publish_date_utc: (record.publish_date.getTime() / 1000),
      info_website: organization.info_website,
      notification_threshold_percent: organization.notificationThresholdPercent,
      notification_threshold_count: organization.notificationThresholdCount,
      concern_point_hashes: this._getPointHashes(trailsChunked, currentPage),
      pages: this._getPaginationInformation(organization, trailsChunked, currentPage)
    };
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
      endpoints: Array.from(Array(trails.length).keys()).map(page => this._apiEndpoint.replace('[PAGE]', (page + 1)))
    }
  }

  /**
   * Get all hashes related to this page.
   *
   * @private
   * @method _getPointHashes
   * @param {Array} trails
   * @param {Number} currentPage
   * @return {Array}
   */
  _getPointHashes(trails, currentPage) {
    const chunk = trails.find(p => p.page === currentPage);
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