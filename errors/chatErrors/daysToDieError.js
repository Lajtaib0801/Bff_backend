const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class daysToDieError extends CustomAPIError {
    constructor() {
        super('The time to live (TTL) must be at least one and cardinal number!')
        this.statusCode = StatusCodes.BAD_REQUEST
    }
}

module.exports = daysToDieError
