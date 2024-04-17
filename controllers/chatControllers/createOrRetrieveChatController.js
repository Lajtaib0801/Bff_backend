const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const Chat = require('../../models/chatroomModel')
const User = require('../../models/userModel')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')
const { youHaveNoFriendWithThisNameError, noUserFoundError } = require('../../errors/userErrors/userErrors')
const mongoose = require('mongoose')
const { StatusCodes } = require('http-status-codes')

const checkMutualChat = tryCatchWrapper(async (req, res, next) => {
    const { friend: friendName } = req.body
    const myId = await getCreatorIdFromHeaders(req.headers)
    const myFriends = (await User.findById(myId).select('friends -_id')).friends
    const friend = await User.findOne({ username: friendName })

    if (!friend) {
        throw new noUserFoundError(friendName)
    }

    if (!myFriends.includes(friend._id)) {
        throw new youHaveNoFriendWithThisNameError(friendName)
    }

    const mutualChat = await Chat.aggregate([
        {
            $match: {
                is_private: true,
                $or: [
                    {
                        owner: new mongoose.Types.ObjectId(myId),
                        users: { $elemMatch: { user_id: new mongoose.Types.ObjectId(friend._id) } },
                    },
                    {
                        owner: new mongoose.Types.ObjectId(friend._id),
                        users: { $elemMatch: { user_id: new mongoose.Types.ObjectId(myId) } },
                    },
                ],
            },
        },
    ])

    return res.status(StatusCodes.OK).json(mutualChat[0])
})

module.exports = { checkMutualChat }
