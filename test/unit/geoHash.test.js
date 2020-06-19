process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const geoHash = require('../../app/lib/geoHash');

describe('Geo Hash', () => {
  it('should return a properly formatted hash', async () => {
    const location = {
      longitude: 14.91328448,
      latitude: 41.24060321,
      time: 1589117939000,
    };
    const hash = await geoHash.encrypt(location, 'salt', true);
    expect(hash.encodedString).to.be.equal('a2dcd196d350fda7');
  });
});
