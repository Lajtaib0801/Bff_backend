const Thread = require('../../models/threadModel')
const User = require('../../models/userModel')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { StatusCodes } = require('http-status-codes')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')
const { noUserFoundError } = require('../../errors/userErrors/userErrors')

const updaterOptions = {
    new: true,
    runValidators: true,
}

const updateThreadController = tryCatchWrapper(async (req, res) => {
    const threadId = req.params.threadId
    const updaterId = await getCreatorIdFromHeaders(req.headers)
    const updater = await User.findOne({ _id: updaterId })
    if (!updater) {
        throw new noUserFoundError(updaterId)
    }
    if (req.body._id) {
        res.status(StatusCodes.FORBIDDEN).json({ message: 'You are not allowed to update the thread id.' })
    }
    if (req.body.likes) {
        res.status(StatusCodes.FORBIDDEN).json({ message: 'You are not allowed to update the likes.' })
    }
    if (req.body.dislikes) {
        res.status(StatusCodes.FORBIDDEN).json({ message: 'You are not allowed to update the dislikes.' })
    }
    if (req.body.creation_date) {
        res.status(StatusCodes.FORBIDDEN).json({ message: 'You are not allowed to update the creation date.' })
    }
    let thread = await Thread.findOne({ '_id.thread_id': threadId })
    if (!thread) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'No thread found.' })
    }
    if (updater.role == 'admin' || thread._id.creator_id == updaterId) {
        thread = await Thread.updateOne({ '_id.thread_id': threadId }, req.body, updaterOptions)
    }
    return res.status(StatusCodes.OK).json(thread)
})

module.exports = updateThreadController
