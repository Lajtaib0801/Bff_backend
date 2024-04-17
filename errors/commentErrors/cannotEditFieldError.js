const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class cannotEditFieldError extends CustomAPIError {
    constructor() {
        super('Cannot edit this field!')
        this.statusCode = StatusCodes.BAD_REQUEST
    }
}

module.exports = cannotEditFieldError
