const BaseService = require('../common/service.js');
const casesService = require('./cases');

class Service extends BaseService {

  findLastOne(query) {
    return this.table.where(query).orderBy('created_at', 'desc').first();
  }

  async findLastPublicationAndCases(options) {
    if (!options.organization_id) throw new Error('Organization ID is invalid.')
    if (!options.status) throw new Error('Status is invalid.')

    const query = {
      organization_id: options.organization_id
    }

    const publication = await this.table.where(query).orderBy('created_at', 'desc').first();
    if (publication) {
      publication.cases = await this.selectPublicationCases(publication.id, options.status)
      return publication
    }
    return null
  }

  async insert(publication) {
    publication.publish_date = new Date(publication.publish_date * 1000);

    const results = await this.create(publication);
    if (results) {
      return results[0];
    }
    throw new Error('Internal server error.')
  }

  async selectPublicationCases(publication_id, state) {
    const cases = await casesService.find({ publication_id: publication_id, state })
    if (cases) {
      return cases.map(c => c.id)
    }
    return []
  }

}

module.exports = new Service('publications');
