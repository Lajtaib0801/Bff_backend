const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class notAuthorizedToDeleteForumError extends CustomAPIError {
    constructor() {
        super('You are not authorized to delete this forum')
        this.statusCode = StatusCodes.UNAUTHORIZED
    }
}

module.exports = notAuthorizedToDeleteForumError
