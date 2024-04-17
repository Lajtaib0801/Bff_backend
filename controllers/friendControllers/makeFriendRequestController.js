const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const User = require('../../models/userModel')
const { StatusCodes } = require('http-status-codes')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')

const makeFriendRequest = tryCatchWrapper(async (req, res) => {
    const id = await getCreatorIdFromHeaders(req.headers)
    const sender = await User.findById(id)
    const user = await User.findOne({ username: req.params.friendName })
    if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({ message: 'No user found to send friend request to!' })
        return
    }
    if (user.username === sender.username) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: 'You cannot send a friend request to yourself!' })
        return
    }
    if (user.friend_requests.includes(sender.username)) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: 'You already sent a friend request to this user!' })
        return
    }
    if (sender.friends.includes(user._id)) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: 'You are already friends with this user!' })
        return
    }
    user.friend_requests.push(sender.username)
    await user.save()
    sender.sent_friend_requests.push(user.username)
    await sender.save()
    res.status(StatusCodes.OK).json({ message: 'Friend request sent' })
    return
})

module.exports = makeFriendRequest
