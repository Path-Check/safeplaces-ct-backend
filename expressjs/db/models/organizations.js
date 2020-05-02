var knex = require('../knex.js');

function Organizations() {
  return knex('organizations');
}

// *** queries *** //

function findOne(filter){
  return Organizations().where(filter).first().then((row) => row);
}

function update(organization){
  let organizationRecord = {};
  organizationRecord.authority_name = organization.authority_name;
  organizationRecord.info_website = organization.info_website;
  organizationRecord.safe_path_json = organization.safe_path_json;
  return Organizations()
    .where({id: organization.id})
    .update(organizationRecord).returning('*');
}

module.exports = {
  findOne: findOne,
  update: update
};
