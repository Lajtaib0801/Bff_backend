const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class forumNameTooLongError extends CustomAPIError {
    constructor() {
        super('Forum name is too long!')
        this.statusCode = StatusCodes.REQUEST_TOO_LONG
    }
}

module.exports = forumNameTooLongError
