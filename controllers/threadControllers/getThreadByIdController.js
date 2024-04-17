const Thread = require('../../models/threadModel')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { StatusCodes } = require('http-status-codes')

const getThreadById = tryCatchWrapper(async (req, res) => {
    const threadId = req.params.threadId
    const thread = await Thread.findOne({ '_id.thread_id': threadId })
    if (!thread) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'No thread found.' })
    }
    res.status(StatusCodes.OK).json(thread)
    return
})

module.exports = getThreadById
