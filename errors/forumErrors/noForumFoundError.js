const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class noForumFoundError extends CustomAPIError {
    constructor(message) {
        if (message) {
            super('No forum found with this name: ' + message)
        }
        else {
            super('No forum found')
        }
        this.statusCode = StatusCodes.NOT_FOUND
    }
}

module.exports = noForumFoundError