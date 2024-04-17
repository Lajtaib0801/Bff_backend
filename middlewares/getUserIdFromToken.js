const jwt = require('jsonwebtoken')
const tryCatchWrapper = require('./tryCatchWrapper')

const getUserIdFromToken = tryCatchWrapper(async (token) => {
    const id = jwt.verify(token, process.env.JWT_SECRET).id
    return id
})

module.exports = getUserIdFromToken
