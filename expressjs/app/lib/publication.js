class Publication {

/**
 * Add Product to order
 *
 * @method build
 * @param {Object} location
 * @param {String} salt
 * @param {Boolean} debug
 * @return {Object}
 */
  build() {
    return {
      authority_name: "Test Health Authority",
      publish_date_utc: 1590143159,
      info_website: "https://raw.githack.com/tripleblindmarket/safe-places/develop/examples/portal.html",
      notification_threshold_percent: 66,
      notification_threshold_count: 6,
      concern_point_hashes: [
        "dd41ce4e93d6a894",
        "5ed529a82083e6fb",
        "eea08af21fbcca0a",
        "06299098f0678352",
        "ddf38896e2e0820b",
        "74e36a948e9bf395",
        "8496059c56636a70",
        "f1224e4df9297a38"
      ],
      pages: {
        measurement: 43200,
        totalPages: 12,
        currentPage: 1,
        pages: [
          "[API_ENDPOINT]/[PUBLICATION_ID]_1.json",
          "[API_ENDPOINT]/[PUBLICATION_ID]_2.json",
          "[API_ENDPOINT]/[PUBLICATION_ID]_3.json",
          "[API_ENDPOINT]/[PUBLICATION_ID]_4.json",
          "[API_ENDPOINT]/[PUBLICATION_ID]_5.json",
          "[API_ENDPOINT]/[PUBLICATION_ID]_6.json",
          "[API_ENDPOINT]/[PUBLICATION_ID]_7.json",
          "[API_ENDPOINT]/[PUBLICATION_ID]_8.json",
          "[API_ENDPOINT]/[PUBLICATION_ID]_9.json",
          "[API_ENDPOINT]/[PUBLICATION_ID]_10.json",
          "[API_ENDPOINT]/[PUBLICATION_ID]_11.json",
          "[API_ENDPOINT]/[PUBLICATION_ID]_12.json",
        ]
      }
    };

  }


/**
 * Add Product to order
 *
 * @private
 * @method build
 * @param {Object} location
 * @param {String} salt
 * @param {Boolean} debug
 * @return {Object}
 */

}