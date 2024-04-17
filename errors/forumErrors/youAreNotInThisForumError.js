const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class youAreNotInThisForumError extends CustomAPIError {
    constructor() {
        super(`You are not in this forum!`)
        this.statusCode = StatusCodes.BAD_REQUEST
    }
}

module.exports = youAreNotInThisForumError
