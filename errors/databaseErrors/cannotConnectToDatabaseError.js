const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class cannotConnectToDatabase extends CustomAPIError {
    constructor(message) {
        super('Cannot connect to the database: ' + message)
        this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    }
}

module.exports = cannotConnectToDatabase
