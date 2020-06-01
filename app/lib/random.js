const { randomFill } = require('crypto');
const { promisify } = require('util');

const randomFillAsync = promisify(randomFill);

/**
 * @class Random
 *
 * Generates random integers using cryptographically secure random bytes.
 *
 */
class Random {

  constructor(capacity) {
    if (capacity < 4 || capacity > 4096) {
      throw new Error('byte count must be between 4 and 4096');
    }
    this._buffer = Buffer.allocUnsafe(capacity || 1024);
    this._pos = -1;
  }

  /**
   * Returns a random number between 0 and (2^(bytes * 8))-1.
   * Bytes may be between 1 and 4.
   *
   * @method next
   * @param {Number} bytes
   * @return {Number}
   */
  async next(bytes) {
    bytes = (bytes || 4);

    if (bytes < 1 || bytes > 4) {
      throw new Error('byte count must be between 1 and 4');
    }

    let result = 0;

    if (this._pos < 0 || this._pos + bytes > this._buffer.length) {
      await randomFillAsync(this._buffer);
      this._pos = 0;
    }

    while (bytes-- > 0) {
      result = ((result << 8) | this._buffer[this._pos++]);
    }

    return (result >>> 0);
  }

}

module.exports = Random;
