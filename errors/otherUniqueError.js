const CustomAPIError = require('./customError')

class otherUniqueError extends CustomAPIError {
    constructor(errorMessage, statusCode) {
        super(errorMessage)
        this.statusCode = statusCode
    }
}

module.exports = otherUniqueError
