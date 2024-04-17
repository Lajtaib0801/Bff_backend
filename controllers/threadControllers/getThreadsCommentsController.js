const Thread = require('../../models/threadModel')
const Comment = require('../../models/commentModel')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { StatusCodes } = require('http-status-codes')
const mongoose = require('mongoose')

const getThreadsComments = tryCatchWrapper(async (req, res) => {
    const threadId = req.params.threadId
    const thread = await Thread.findOne({ '_id.thread_id': threadId })
    if (!thread) {
        res.status(StatusCodes.NOT_FOUND).json({
            message: 'Thread not found',
        })
        return
    }
    const comments = await Comment.aggregate([
        {
            $match: { '_id.room_id': new mongoose.Types.ObjectId(threadId) },
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
            $unwind: '$creator',
        },
        {
            $addFields: {
                creator: '$creator.username',
            },
        },
    ])
    res.status(StatusCodes.OK).json(comments)
    return
})

module.exports = getThreadsComments
