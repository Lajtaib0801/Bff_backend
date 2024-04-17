const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class tooLongCommentError extends CustomAPIError {
    constructor(commentLength) {
        super(`Too many characters in the comment (${commentLength}).The max comment length is 2000 characters!`)
        this.statusCode = StatusCodes.REQUEST_TOO_LONG
    }
}

module.exports = tooLongCommentError
