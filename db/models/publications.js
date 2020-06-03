const _ = require('lodash');
const knex = require('../knex.js');
const BaseService = require('../common/service.js');
const casesService = require('./cases');
const pointsService = require('./points');

class Service extends BaseService {

  findLastOne(query) {
    return knex(this._name).where(query).orderBy('created_at', 'desc').first();
  }

  async findLastPublicationAndCases(options) {
    if (!options.organization_id) throw new Error('Organization ID is invalid.')
    if (!options.status) throw new Error('Status is invalid.')

    const query = {
      organization_id: options.organization_id
    }

    const publication = await knex(this._name).where(query).orderBy('created_at', 'desc').first();
    if (publication) {
      publication.cases = await this.selectPublicationCases(publication.id, options.status)
      return publication
    }
    return null
  }

  async insert(publication) {
    publication.start_date = new Date(publication.start_date * 1000);
    publication.end_date = new Date(publication.end_date * 1000);
    publication.publish_date = new Date(publication.publish_date * 1000);

    const results = await knex(this._name).insert(publication).returning('*');
    if (results) {
      
      let intervalCheck = await pointsService.findIntervalCases(results[0])
      if (intervalCheck.length > 0) {
        const casesUpdateResults = await casesService.updateCasePublicationId(intervalCheck, results[0].id)
        if (!casesUpdateResults) {
          throw new Error('Internal server error.')
        }
      }
      return _.extend(results[0], { cases: intervalCheck })
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