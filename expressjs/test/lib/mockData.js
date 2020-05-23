const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const users = require('../../db/models/users');
const cases = require('../../db/models/cases');
const organizations = require('../../db/models/organizations');

class MockData {
  /**
   * @method mockUser
   *
   * Generate Mock User
   */
  async mockUser(options = {}) {
    if (!options.username) throw new Error('Username must be provided');
    if (!options.password) throw new Error('Password must be provided');
    if (!options.organization) throw new Error('Organization must be provided');
    if (!options.email) throw new Error('Email must be provided');

    if (!process.env.SEED_MAPS_API_KEY) {
      throw new Error('Populate environment variable SEED_MAPS_API_KEY');
    }

    const password = await bcrypt.hash(options.password, 5);

    const params = {
      id: uuidv4(),
      organization_id: options.organization,
      username: options.username,
      password: password,
      email: options.password,
      maps_api_key: process.env.SEED_MAPS_API_KEY,
    };

    const results = await users.create(params);
    if (results) {
      return results[0];
    }
    throw new Error('Problem adding the organization.');
  }

  /**
   * @method mockOrganization
   *
   * Generate Mock Organization
   */
  async mockOrganization(options = {}) {
    if (!options.authority_name)
      throw new Error('Authority Name must be provided');
    if (!options.info_website) throw new Error('Info Website must be provided');

    const results = await organizations.create(options);
    if (results) {
      return results[0];
    }
    throw new Error('Problem adding the organization.');
  }

  async mockCase(options = {}) {
    if (!options.state) throw new Error('State must be provided.');

    const params = {
      id: uuidv4(),
      state: options.state,
    };

    const results = await cases.create(params);
    if (results) {
      return results[0];
    }
    throw new Error('Problem adding the case.');
  }
}

module.exports = new MockData();
