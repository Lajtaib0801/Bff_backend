const CustomAPIError = require('../errors/customError')
const { StatusCodes } = require('http-status-codes')

const errorHandlerMiddleware = (err, req, res, next) => {
    if (err instanceof CustomAPIError) {
        return res.status(err.statusCode).json({ message: err.message })
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err })
}

module.exports = errorHandlerMiddleware
