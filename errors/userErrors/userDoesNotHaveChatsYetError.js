const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class userDoesNotHaveChatsYet extends CustomAPIError {
    constructor() {
        super('User does not have any chats yet!')
        this.statusCode = StatusCodes.NOT_FOUND
    }
}

module.exports = userDoesNotHaveChatsYet
