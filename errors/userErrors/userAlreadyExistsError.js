const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class userAlreadyExistsError extends CustomAPIError {
    constructor(userProperty) {
        super('User already exists with: ' + userProperty)
        this.statusCode = StatusCodes.CONFLICT
    }
}

module.exports = userAlreadyExistsError