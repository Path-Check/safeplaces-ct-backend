process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const { caseService } = require('../../app/lib/db');

let currentCase

describe.only('Data Layer Test', () => {

  before(async () => {
    await caseService.deleteAllRows()

    let expires_at = new Date().getTime() - ((86400 * 10) * 1000);

    const params = {
      state: 'unpublished',
      organization_id: 1,
      external_id: 1,
      expires_at: new Date(expires_at)
    };
 
    currentCase = await caseService.createCase(params)
  })

  it('should find the case just created', async () => {
    const caseFromDatabase = await caseService.findOne({ id: currentCase.caseId })
    expect(currentCase.caseOd).to.be.equal(caseFromDatabase.caseId);
  });
});
