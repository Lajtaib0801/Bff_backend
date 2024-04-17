const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class youHaveNoFriendWithThisNameError extends CustomAPIError {
    constructor(username) {
        super(`You have no friend with this name: '${username}'!`)
        this.statusCode = StatusCodes.NOT_FOUND
    }
}

module.exports = youHaveNoFriendWithThisNameError
