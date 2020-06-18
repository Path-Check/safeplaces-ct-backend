exports.seed = function (knex) {
  return knex('organizations')
    .del() // Deletes ALL existing entries
    .then(async function () {

      await knex('organizations').insert({
        id: 1,
        name: 'Dev Organization',
        external_id: '1eb7c9ac-e417-4845-a7e3-a74db447ecc7'
      });

      await knex('settings').insert({
        id: 'a88309c2-26cd-4d2b-8923-af0779e423a3',
        organization_id: 1,
        info_website_url:
          'https://www.who.int/emergencies/diseases/novel-coronavirus-2019',
        api_endpoint_url:
          'https://storage.googleapis.com/staging-spl-ha/',
        notification_threshold_percent: 66,
        notification_threshold_timeframe: 30,
        reference_website_url: 'https://www.who.int/',
        privacy_policy_url: 'https://www.who.int/about/who-we-are/privacy-policy'
      });

      await knex('organizations').insert({
        id: 2,
        name: 'Sith Organization',
        external_id: '57eb4a71-1e24-4d59-8f8f-59c640668623'
      });

      await knex('settings').insert({
        id: '2f7cd385-8d9d-494b-8223-8e4d40446b17',
        organization_id: 2,
        info_website_url:
          'https://www.who.int/emergencies/diseases/novel-coronavirus-2019',
        api_endpoint_url:
          'https://storage.googleapis.com/staging-spl-ha/',
        notification_threshold_percent: 66,
        notification_threshold_timeframe: 30,
        reference_website_url: 'https://www.who.int/',
        privacy_policy_url: 'https://www.who.int/about/who-we-are/privacy-policy'
      });
    });
};
