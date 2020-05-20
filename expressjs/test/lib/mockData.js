const _ = require('lodash')

class MockData {

  /**
   * @method mockUserVictim
   * 
   * Generate Mock User
   */
  async mockUser(options={}) {

    const { seekerInfo } = defendentPayload

    const data = _.extend(seekerInfo, options)

    const user = await userService.createUser(data)
    if (user) {
      return user
    } else {
      throw new Error('Could not create user.')
    }
  }

}


module.exports = new MockData()
