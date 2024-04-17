const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class userIsAlreadyLoggedInError extends CustomAPIError {
    constructor() {
        super('User is already logged in!')
        this.statusCode = StatusCodes.FORBIDDEN
    }
}

module.exports = userIsAlreadyLoggedInError
