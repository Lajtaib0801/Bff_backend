const Comment = require('../../models/commentModel')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { StatusCodes } = require('http-status-codes')

const deleteThreadComment = tryCatchWrapper(async (req, res) => {
    const commentId = req.params.commentId
    const comment = await Comment.findOne({ '_id.message_id': commentId })
    if (!comment) {
        res.status(StatusCodes.NOT_FOUND).json({
            message: 'Comment not found',
        })
        return
    }
    await comment.deleteOne()
    res.status(StatusCodes.OK).json({
        message: 'Comment deleted',
    })
    return
})

module.exports = deleteThreadComment