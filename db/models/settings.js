const BaseService = require('../common/service.js');

class Service extends BaseService {
  async updateByOrganizationId(organization_id, params) {
    if (!organization_id) throw new Error('Organization ID was not valid');
    if (!params) throw new Error('Params were not valid');

    const settings = await this.table
      .where({ organization_id: organization_id })
      .returning('id')
      .first();

    if (settings) {
      const result = await this.updateOne(settings.id, params);

      if (result) {
        return result;
      }
    }
  }
}

module.exports = new Service('settings');
