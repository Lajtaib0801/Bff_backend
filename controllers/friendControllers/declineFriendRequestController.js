const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const User = require('../../models/userModel')
const { StatusCodes } = require('http-status-codes')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')

const declineFriendRequest = tryCatchWrapper(async (req, res) => {
    const id = await getCreatorIdFromHeaders(req.headers)
    const decliner = await User.findById(id)
    if (!decliner.friend_requests.includes(req.params.requestCreatorName)) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: 'You have no pending friend requests from this user!' })
        return
    }
    decliner.friend_requests.pull(req.params.requestCreatorName)
    await decliner.save()
    const requester = await User.findOne({ username: req.params.requestCreatorName })
    requester.sent_friend_requests.pull(decliner.username)
    await requester.save()
    res.status(StatusCodes.OK).json({ message: 'Friend request declined' })
    return
})

module.exports = declineFriendRequest
