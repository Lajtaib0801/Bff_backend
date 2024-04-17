const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class usersAlreadyHaveMutualPrivateChatroomError extends CustomAPIError {
    constructor() {
        super('Users already have mutual private chatroom')
        this.statusCode = StatusCodes.CONFLICT
    }
}

module.exports = usersAlreadyHaveMutualPrivateChatroomError
