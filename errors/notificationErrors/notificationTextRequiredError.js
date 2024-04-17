const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class notificationTextRequiredError extends CustomAPIError {
    constructor() {
        super('Notification text is required!')
        this.statusCode = StatusCodes.BAD_REQUEST
    }
}

module.exports = notificationTextRequiredError
