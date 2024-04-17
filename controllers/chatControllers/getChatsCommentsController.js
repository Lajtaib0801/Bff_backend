const Chat = require('../../models/chatroomModel')
const Comment = require('../../models/commentModel')
const { StatusCodes } = require('http-status-codes')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { noChatFoundError } = require('../../errors/chatErrors/chatErrors')
const mongoose = require('mongoose')

const getChatsComments = tryCatchWrapper(async (req, res) => {
    const chat = await Chat.findById(req.params.chatId)
    const page = parseInt(req.query.page) || 0
    const limit = parseInt(req.query.limit) || 10
    const skip = page * 10
    if (!chat) {
        throw new noChatFoundError(req.params.chatId)
    }
    let comments = await Comment.aggregate([
        {
            $match: {
                '_id.room_id': new mongoose.Types.ObjectId(chat._id),
            },
        },
        {
            $lookup: {
                from: 'Users',
                localField: '_id.creator_id',
                foreignField: '_id',
                as: 'creator',
            },
        },
        {
            $addFields: {
                creator: { $arrayElemAt: ['$creator', 0] },
            },
        },
        {
            $addFields: {
                creator_name: '$creator.username',
            },
        },
        {
            $project: {
                creator: 0,
                _id: {
                    creator_id: 0,
                },
            },
        }
    ])
    const pagesCount = Math.ceil(comments.length / 10)
    comments = comments.slice(skip, limit)
    res.status(StatusCodes.OK).json({ pagesCount, comments })
    return
})

module.exports = getChatsComments
