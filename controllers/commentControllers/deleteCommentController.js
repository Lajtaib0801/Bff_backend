const Comment = require('../../models/commentModel')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { StatusCodes } = require('http-status-codes')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')
const { noCommentFoundError, cannotDeleteCommentError } = require('../../errors/commentErrors/commentErrors')

const deleteComment = tryCatchWrapper(async (req, res) => {
    const userId = await getCreatorIdFromHeaders(req.headers)
    const commentId = req.params.commentId
    const comment = await Comment.findOne({ '_id.message_id': commentId })
    if (!comment) {
        throw new noCommentFoundError()
    }
    if (comment._id.creator_id.toString() !== userId && (await User.findById(userId).role) != 'admin') {
        throw new cannotDeleteCommentError()
    }
    await Comment.deleteOne({ '_id.message_id': commentId })
    res.status(StatusCodes.OK).json({ message: 'Comment deleted successfully' })
})

module.exports = deleteComment
