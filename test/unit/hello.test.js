require('chai');

describe('Test', () => {
  it('should know when I am saying hello', () => {
    const testString = 'Hello world';
    testString.should.equal('Hello world');
  });
});