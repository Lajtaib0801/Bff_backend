const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const User = require('../../models/userModel')
const { StatusCodes } = require('http-status-codes')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')

const getFriends = tryCatchWrapper(async (req, res) => {
    const id = await getCreatorIdFromHeaders(req.headers)
    const friendIds = await User.findById(id).select('friends -_id')
    if (!friendIds) {
        res.status(StatusCodes.NOT_FOUND).json({ message: 'No friends found' })
        return
    }
    const friends = []
    for (const id of friendIds.friends) {
        const friend = await User.findById(id)
        friends.push({
            username: friend.username,
        })
    }
    const page = parseInt(req.query.page) || 0
    const limit = parseInt(req.query.limit) || 10
    const skip = page * 10
    const pagesCount = Math.ceil(friends.length / 10)
    const returnFriends = friends.splice(skip, limit)
    res.status(StatusCodes.OK).json({ pagesCount, returnFriends })
    return
})

module.exports = getFriends
