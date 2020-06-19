const BaseService = require('../common/service.js');
const Random = require('../../app/lib/random');

const rand = new Random();

const ELEMENTS = [...'0123456789'];
const LENGTH = 6;

class Service extends BaseService {

  async create(attempts) {
    // Cleanup old records
    await this._deleteExpired();

    // Try to generate a unique code a maximum number of times before aborting
    attempts = (attempts || 10);

    while (attempts > 0) {
      let value = await this.generateValue();

      // Attempt to create the code. This may fail if the value is in use,
      // in which case we'll try again.
      try {
        return (await super.create({ value }))[0];
      } catch (error) {
        attempts -= 1;
      }
    }

    // Failed to generate a code in the max number of attempts.
    // This should be extremely unlikely in practice.
    return null;
  }

  find(query) {
    if (!query) throw new Error('Query is invalid');

    return super.find(query).first(
      'id',
      'value',
      'upload_consent',
      this.database.raw('COALESCE(invalidated_at, NOW()) >= NOW() AS valid'),
    );
  }

  async generateValue() {
    let value = '';

    while (value.length < LENGTH) {
      // Generate a random 1-byte integer
      let entropy = await rand.next(1);

      // There are only 10 possible digits (ELEMENTS.length),
      // so each 1-byte random number can be used for 2 elements.
      const lhs = (entropy & 0xF);
      const rhs = ((entropy >>> 4) & 0xF);

      if (lhs < ELEMENTS.length) {
        value += ELEMENTS[lhs];
      }
      if (rhs < ELEMENTS.length && value.length < LENGTH) {
        value += ELEMENTS[rhs];
      }
    }

    return value;
  }

  _deleteExpired() {
    return this.table.whereRaw("created_at < NOW() - INTERVAL '2 hours'").del();
  }

}

module.exports = new Service('access_codes', 'public');
