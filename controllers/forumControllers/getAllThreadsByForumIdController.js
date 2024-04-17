const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { StatusCodes } = require('http-status-codes')
const Thread = require('../../models/threadModel')

const getAllThreadsByForumId = tryCatchWrapper(async (req, res) => {
    const page = parseInt(req.query.page) || 0
    const limit = parseInt(req.query.limit) || 10
    const skip = Math.abs(page * 10)
    const pagesCount = Math.ceil((await Thread.countDocuments()) / 10)
    const threads = await Thread.find({ '_id.forum_id': req.params.forumId }).skip(skip).limit(limit)
    if (!threads) {
        res.status(StatusCodes.NOT_FOUND).json({
            message: 'No threads found',
        })
        return
    }
    res.status(StatusCodes.OK).json({ pagesCount, threads })
    return
})

module.exports = getAllThreadsByForumId
