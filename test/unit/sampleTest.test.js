process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const mockData = require('../lib/mockData');

const { caseService } = require('../../app/lib/db');

let currentCase;

describe('Data Layer Test', () => {
  before(async () => {
    await mockData.clearMockData();

    let orgParams = {
      name: 'My Example Organization',
      info_website_url: 'http://sample.com',
    };
    const currentOrg = await mockData.mockOrganization(orgParams);

    let newUserParams = {
      username: 'myAwesomeUser',
      password: 'myAwesomePassword',
      email: 'myAwesomeUser@yomanbob.com',
      organization_id: currentOrg.id,
    };
    await mockData.mockUser(newUserParams);

    let expires_at = new Date().getTime() - 86400 * 10 * 1000;

    const params = {
      state: 'unpublished',
      organization_id: currentOrg.id,
      external_id: 1,
      expires_at: new Date(expires_at),
    };

    currentCase = await caseService.createCase(params);
  });

  it('should find the case just created', async () => {
    const caseFromDatabase = await caseService.findOne({
      id: currentCase.caseId,
    });
    expect(currentCase.caseOd).to.be.equal(caseFromDatabase.caseId);
  });
});
