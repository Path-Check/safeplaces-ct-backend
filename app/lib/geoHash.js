const geohash = require('ngeohash');
const crypto = require('crypto');
const Promise = require('bluebird');

/*

We use a scrypt hash with the following parameters:

- A “cost” (N) that is to be determined.  For initial implemention we 
  use 2^12 = 16384.  For improved security we expect to move to 
  2^16,. 2^17 or 2^18 for production, but the exact value still needs 
  to be determined.
- A block size (r) of 8 - this is the default.
- Parallelization (p) of 1 - this is the default.
- A keylen (output) of 8 bytes = 16 hex digits.

*/

/**
 * Encrypt location into a Hash
 *
 * @method encrypt
 * @param {Object} location
 * @param {String} salt
 * @param {Boolean} debug
 * @return {String}
 */

const encrypt = async (location, salt = 'salt') => {
  const roundDownTo = roundTo => x => Math.floor(x / roundTo) * roundTo;
  const roundDownTo5Minutes = roundDownTo(1000 * 60 * 5);
  const roundedTime = roundDownTo5Minutes(new Date(location.time));
  const hash = geohash.encode(location.latitude, location.longitude, 8); // precision of 8
  const secret = `${hash}${roundedTime}`;

  const options = {
    N: 4096, // Only option that we might want to change.
  };

  const derivedKey = await Promise.fromCallback(cb =>
    crypto.scrypt(secret, salt, 8, options, cb),
  );
  if (derivedKey) {
    const encodedString = derivedKey.toString('hex');
    return { hash, secret, encodedString };
  }
};

/**
 * Add Product to order
 *
 * @method decrypt
 * @param {String} hash
 * @return {Object}
 */
const decryptHash = hash => {
  return geohash.decode(hash);
};

module.exports = {
  encrypt,
  decryptHash,
};
