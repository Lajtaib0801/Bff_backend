const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class noUserFoundError extends CustomAPIError {
    constructor(userProperty) {
        super('No user found with: ' + userProperty)
        this.statusCode = StatusCodes.NOT_FOUND
    }
}

module.exports = noUserFoundError
