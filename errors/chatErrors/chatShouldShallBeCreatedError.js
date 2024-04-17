const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class chatShallBeCreatedError extends CustomAPIError {
    constructor() {
        super('The creation of the room is needed. { name, is_ttl, days_to_die, is_private } should be specified')
        this.statusCode = StatusCodes.UNPROCESSABLE_ENTITY
    }
}

module.exports = chatShallBeCreatedError
