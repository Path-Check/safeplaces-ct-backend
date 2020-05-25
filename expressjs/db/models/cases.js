const BaseService = require('../common/service.js');

class Service extends BaseService {
  updateState(id, state) {
    if (['unpublished', 'staging', 'published'].indexOf(state) === -1) {
      throw new Error('Invalid state ' + state);
    }
    return this.updateOne(id, {
      state,
    });
  }
}

module.exports = new Service('cases');