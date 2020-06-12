const mockData = require('../test/lib/mockData');

/**
 * #############################################
 * 1000 points returned in 9.999 seconds
 * 3000 points returned in 28.629 seconds
 * #############################################
 */

let orgParams = {
  name: 'My Example Organization',
  info_website_url: 'http://sample.com',
};

let startTime;

function testLoad(numberOfRecords) {
  console.log(`Testing ${numberOfRecords} records.`);
  return mockData
    .clearMockData()
    .then(() => mockData.mockOrganization(orgParams))
    .then(data => {
      startTime = new Date().getTime();
      return data;
    })
    .then(data => {
      const params = {
        organization_id: data.id,
        state: 'unpublished',
        startTime: new Date().getTime() - 86400000 * 30,
        numberOfRecords,
      };
      return mockData.mockTrailsLoadTest(params);
    })
    .then(results => {
      const finalTime = new Date().getTime();
      console.log('');
      console.log('#############################################');
      console.log(
        `${results.length} points returned in ${
          (finalTime - startTime) / 1000
        } seconds`,
      );
      console.log('#############################################');
      console.log('');
    })
    .catch(e => console.log(e));
}

testLoad(1000)
  .then(() => testLoad(3000))
  .then(() => testLoad(25000))
  .then(() => testLoad(50000));
