const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class cannotEditCommentError extends CustomAPIError {
    constructor() {
        super('You cannot edit this comment!')
        this.statusCode = StatusCodes.UNAUTHORIZED
    }
}

module.exports = cannotEditCommentError
