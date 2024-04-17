const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class notAllowedToDeleteChatError extends CustomAPIError {
    constructor() {
        super(`You are not allowed to delete this chat.`)
        this.statusCode = StatusCodes.FORBIDDEN
    }
}

module.exports = notAllowedToDeleteChatError
