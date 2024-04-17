const CustomAPIError = require('../customError')
const { StatusCodes } = require('http-status-codes')

class noPermissionToUsePathError extends CustomAPIError {
    constructor(path) {
        super('You have no permission to use path: ' + path)
        this.statusCode = StatusCodes.UNAUTHORIZED
    }
}

module.exports = noPermissionToUsePathError
