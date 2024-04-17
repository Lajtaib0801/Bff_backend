const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class parentCommentDoesNotExistError extends CustomAPIError {
    constructor(parentCommentId) {
        super('Parent comment does not exist with this id: ' + parentCommentId)
        this.statusCode = StatusCodes.NOT_FOUND
    }
}

module.exports = parentCommentDoesNotExistError
