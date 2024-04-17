const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class forumDescriptionIsTooLongError extends CustomAPIError {
    constructor() {
        super('Forum description is too long!')
        this.statusCode = StatusCodes.REQUEST_TOO_LONG
    }
}

module.exports = forumDescriptionIsTooLongError
