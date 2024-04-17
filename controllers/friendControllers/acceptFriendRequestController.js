const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const User = require('../../models/userModel')
const { StatusCodes } = require('http-status-codes')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')

const acceptFriendRequest = tryCatchWrapper(async (req, res) => {
    const id = await getCreatorIdFromHeaders(req.headers)
    const accepter = await User.findById(id)
    const friend = await User.findOne({ username: req.params.requestCreatorName })
    if (!accepter.friend_requests.includes(req.params.requestCreatorName)) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: 'You have no pending friend requests from this user!' })
        return
    }
    accepter.friends.push(friend._id)
    accepter.friend_requests.pull(req.params.requestCreatorName)
    await accepter.save()
    friend.sent_friend_requests.pull(accepter.username)
    friend.friends.push(accepter._id)
    await friend.save()
    res.status(StatusCodes.OK).json({ message: 'Friend request accepted' })
    return
})

module.exports = acceptFriendRequest
