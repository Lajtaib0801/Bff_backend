const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class youCannotEditThisFieldError extends CustomAPIError {
    constructor() {
        super('You cannot edit this field!')
        this.statusCode = StatusCodes.UNAUTHORIZED
    }
}

module.exports = youCannotEditThisFieldError
