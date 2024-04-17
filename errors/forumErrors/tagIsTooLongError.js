const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class tagIsTooLongError extends CustomAPIError {
    constructor() {
        super('A tag cannot be longer than 15 characters!')
        this.statusCode = StatusCodes.REQUEST_TOO_LONG
    }
}

module.exports = tagIsTooLongError
