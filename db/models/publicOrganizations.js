const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');

const BaseService = require('../common/service.js');

class Service extends BaseService {
  async createOrUpdate(id, params) {
    const existing = await this.findOne({ id });

    if (existing) {
      return this.updateOne(id, params);
    } else {
      params = _.extend({ id, external_id: uuidv4() }, params);
      return this.create(params);
    }
  }
}

module.exports = new Service('organizations', 'public');
