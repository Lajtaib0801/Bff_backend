const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class noForumNameGivenError extends CustomAPIError {
    constructor() {
        super('Please provide a forum name')
        this.statusCode = StatusCodes.BAD_REQUEST
    }
}

module.exports = noForumNameGivenError
