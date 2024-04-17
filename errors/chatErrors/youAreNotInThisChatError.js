const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class youAreNotInThisChatError extends CustomAPIError {
    constructor() {
        super(`You are not in this chat!`)
        this.statusCode = StatusCodes.BAD_REQUEST
    }
}

module.exports = youAreNotInThisChatError
