const Thread = require('../../models/threadModel')
const Forum = require('../../models/forumModel')
const User = require('../../models/userModel')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { StatusCodes } = require('http-status-codes')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')
const { noUserFoundError } = require('../../errors/userErrors/userErrors')

const deleteThreadConroller = tryCatchWrapper(async (req, res) => {
    const threadId = req.params.threadId
    const deleterId = await getCreatorIdFromHeaders(req.headers)
    const deleter = await User.findOne({ _id: deleterId })
    if (!deleter) throw new noUserFoundError(deleterId)
    const thread = await Thread.findOne({ '_id.thread_id': threadId })
    if (!thread) return res.status(StatusCodes.NOT_FOUND).json({ message: 'No thread found.' })
    if (deleter.role == 'admin' || thread._id.creator_id == deleterId) {
        await Forum.updateMany({ threads: { $in: [threadId] } }, { $pull: { threads: threadId } })
        await Thread.deleteOne({ '_id.thread_id': threadId })
        return res.status(StatusCodes.OK).json({ message: 'Thread deleted successfully.' })
    }
    return res.status(StatusCodes.FORBIDDEN).json({ message: 'You are not allowed to delete this thread.' })
})

module.exports = deleteThreadConroller
