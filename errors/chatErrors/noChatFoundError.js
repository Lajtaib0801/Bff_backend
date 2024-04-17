const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class noChatFoundError extends CustomAPIError {
    constructor(chatId) {
        super(`No chat found with id: ${chatId}`)
        this.statusCode = StatusCodes.NOT_FOUND
    }
}

module.exports = noChatFoundError
