const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class forumAlreadyExists extends CustomAPIError {
    constructor(message) {
        super('Forum already exists with name: ' + message)
        this.statusCode = StatusCodes.CONFLICT
    }
}

module.exports = forumAlreadyExists
