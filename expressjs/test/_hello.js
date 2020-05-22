describe('Test', function () {
  it('should know when I am saying hello', function (done) {
    let testString = 'Hello world';
    testString.should.equal('Hello world');
    done();
  });
});
