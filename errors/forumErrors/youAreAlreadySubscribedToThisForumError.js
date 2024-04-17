const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class youAreAlreadySubscribedToThisForumError extends CustomAPIError {
    constructor() {
        super(`You are already subscribed to this forum!`)
        this.statusCode = StatusCodes.BAD_REQUEST
    }
}

module.exports = youAreAlreadySubscribedToThisForumError
