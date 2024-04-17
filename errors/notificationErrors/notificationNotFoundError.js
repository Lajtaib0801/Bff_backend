const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class notificationNotFoundError extends CustomAPIError {
    constructor() {
        super('Notification not found!')
        this.statusCode = StatusCodes.NOT_FOUND
    }
}

module.exports = notificationNotFoundError
