const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class youAreBannedFromThisForumError extends CustomAPIError {
    constructor() {
        super(`You are banned from this forum!`)
        this.statusCode = StatusCodes.UNAUTHORIZED
    }
}

module.exports = youAreBannedFromThisForumError
