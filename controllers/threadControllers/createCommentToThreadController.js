const Thread = require('../../models/threadModel')
const User = require('../../models/userModel')
const Comment = require('../../models/commentModel')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { StatusCodes } = require('http-status-codes')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')
const { noUserFoundError } = require('../../errors/userErrors/userErrors')

const createCommentToThread = tryCatchWrapper(async (req, res) => {
    const userId = await getCreatorIdFromHeaders(req.headers)
    const user = await User.findById(userId)
    if (!user) {
        throw new noUserFoundError(userId)
    }
    const threadId = req.body.thread_id
    if (!(await Thread.exists({ '_id.thread_id': threadId }))) {
        res.status(StatusCodes.NOT_FOUND).json({
            message: 'Thread not found',
        })
        return
    }
    const comment = new Comment({
        _id: {
            room_id: threadId,
            creator_id: userId,
        },
        text: req.body.text,
        reply: {
            is_reply: req.body.is_reply,
        },
    })
    await comment.save()
    res.status(StatusCodes.CREATED).json({ success: true })
    return
})

module.exports = createCommentToThread
