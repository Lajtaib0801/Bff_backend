const { StatusCodes } = require('http-status-codes')

const notFound = (req, res) =>
    res.status(StatusCodes.NOT_FOUND).json({ message: `Route does not exist: ${req.method} on '${req.originalUrl}' path` })

module.exports = notFound
