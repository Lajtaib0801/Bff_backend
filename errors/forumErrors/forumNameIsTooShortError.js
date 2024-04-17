const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class forumNameIsTooShortError extends CustomAPIError {
    constructor() {
        super('Forum name is too short!')
        this.statusCode = StatusCodes.BAD_REQUEST
    }
}

module.exports = forumNameIsTooShortError
