const _ = require('lodash');

class MockData {

  /**
   * @method mockUser
   * 
   * Generate Mock User
   */
  async mockUser(options={}) {

    const { info } = options;

    const data = _.extend(info, options);

    return data;

    // const user = await userService.createUser(data);
    // if (user) {
    //   return user;
    // } else {
    //   throw new Error('Could not create user.');
    // }
  }

}


module.exports = new MockData();
