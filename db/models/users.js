const BaseService = require('../common/service.js');

class Service extends BaseService {
  update(id, organization) {
    let organizationRecord = {};
    organizationRecord.authority_name = organization.authority_name;
    organizationRecord.info_website = organization.info_website;
    organizationRecord.safe_path_json = organization.safe_path_json;

    this.updateMany({ id }, organization);
  }
}

module.exports = new Service('users');