const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class noCommentFoundError extends CustomAPIError {
    constructor() {
        super('Comment not found')
        this.statusCode = StatusCodes.NOT_FOUND
    }
}

module.exports = noCommentFoundError
