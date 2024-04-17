const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class notAuthorizedToBanUsersFromForumError extends CustomAPIError {
    constructor() {
        super('You are not authorized to ban users from this forum')
        this.statusCode = StatusCodes.UNAUTHORIZED
    }
}

module.exports = notAuthorizedToBanUsersFromForumError
