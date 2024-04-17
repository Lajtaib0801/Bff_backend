const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const { noUserFoundError } = require('../errors/userErrors/userErrors')
const { StatusCodes } = require('http-status-codes')
const otherUniqueError = require('../errors/otherUniqueError')

const getCreatorIdFromHeaders = async (headers) => {
    if (headers.authorization) {
        const token = headers.authorization.split(' ')[1]
        const { id: decodedCreatorId } = jwt.verify(token, process.env.JWT_SECRET)
        if (!(await User.findById(decodedCreatorId))) {
            throw new noUserFoundError(decodedCreatorId)
        }
        return decodedCreatorId
    }
    throw new otherUniqueError('Authorization field is empty! (No token given)', StatusCodes.UNAUTHORIZED)
}

module.exports = getCreatorIdFromHeaders
