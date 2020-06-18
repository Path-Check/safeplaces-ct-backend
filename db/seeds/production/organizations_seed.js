exports.seed = function (knex) {
  return knex('organizations')
    .then(async function () {

      await knex('organizations').insert({
        id: 1,
        name: 'Sample Health Authority'
      });

      await knex('settings').insert({
        id: '2f7cd385-8d9d-494b-8223-8e4d40446b17',
        organization_id: 1,
        info_website_url:
          'https://www.who.int/emergencies/diseases/novel-coronavirus-2019',
        api_endpoint_url:
          'https://storage.googleapis.com/prod-spl-ha/',
        notification_threshold_percent: 66,
        notification_threshold_timeframe: 30,
        reference_website_url: 'https://www.who.int/',
        privacy_policy_url: 'https://www.who.int/about/who-we-are/privacy-policy'
      });
    });
};
