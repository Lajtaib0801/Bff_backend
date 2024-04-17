const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class cannotDeleteCommentError extends CustomAPIError {
    constructor() {
        super('You cannot delete this comment!')
        this.statusCode = StatusCodes.UNAUTHORIZED
    }
}

module.exports = cannotDeleteCommentError
