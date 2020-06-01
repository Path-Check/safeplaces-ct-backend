const BaseService = require('../common/service.js');
const Random = require('../../app/lib/random');

const knex = require('../knex.js');
const rand = new Random();

const ELEMENTS = [...'0123456789'];
const LENGTH = 6;

class Service extends BaseService {

  async create() {
    let value = '';

    // Try to generate a unique code a maximum of 10 times before aborting
    let attempts = 10;

    while (attempts > 0) {
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

      // Attempt to create the code. This may fail if the value is in use,
      // in which case we'll try again.
      if (value.length == LENGTH) {
        try {
          const code = await super.create({ value: value });
          return await this.find({ id: code.id });
        } catch (error) {
          value = '';
          attempts -= 1;
        }
      }
    }

    // Failed to generate a code in the max number of attempts.
    // This should be extremely unlikely in practice.
    return null;
  }

  async find(query) {
    if (!query) throw new Error('Query is invalid');

    return super.find(query).first(
      'id',
      'value',
      'upload_consent',
      knex.raw('COALESCE(invalidated_at, NOW()) >= NOW() AS valid'),
    );
  }

  async invalidate(code) {
    if (!code || !code.id) throw new Error('Query is invalid');

    await this.updateOne(code.id, {
      invalidated_at: knex.fn.now(),
    });

    code.valid = false;
  }

}

module.exports = new Service('access_codes');
