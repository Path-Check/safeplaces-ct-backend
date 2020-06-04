const BaseService = require('../common/service.js');

class Service extends BaseService {

  fetchPoints(accessCode) {
    if (accessCode == null || accessCode.id == null) {
      throw new Error('accessCode is invalid');
    }

    return this.find({ access_code_id: accessCode.id }).select(
      'id',
      'upload_id',
      'coordinates',
      'time',
      'hash',
    )
  }

  deletePoints(accessCode) {
    if (accessCode == null || accessCode.id == null) {
      throw new Error('accessCode is invalid');
    }

    return this.deleteWhere({ access_code_id: accessCode.id });
  }

}

module.exports = new Service('points', 'public');
