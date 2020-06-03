exports.seed = function (knex) {
  return knex('organizations')
    .del()
    .then(async function () {
      
      await knex('organizations').insert({
        id: 1,
        name: 'Dev Organization'
      });

      await knex('settings').insert({
        id: 'a88309c2-26cd-4d2b-8923-af0779e423a3',
        organization_id: 1,
        info_website_url:
          'https://www.who.int/emergencies/diseases/novel-coronavirus-2019',
        api_endpoint_url:
          'https://api.something.give/safe_path/',
      });

    });
};
