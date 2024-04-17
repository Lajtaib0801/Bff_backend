const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class userIsAlreadyBannedFromForumError extends CustomAPIError {
    constructor() {
        super('User is already banned from this forum')
        this.statusCode = StatusCodes.BAD_REQUEST
    }
}

module.exports = userIsAlreadyBannedFromForumError
