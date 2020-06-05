const expect = require('chai').expect;

describe('Test', () => {
  it('should know when I am saying hello', () => {
    const testString = 'Hello world';
    expect(testString).to.be.equal('Hello world');
  });
});