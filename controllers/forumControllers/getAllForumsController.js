const Forum = require('../../models/forumModel')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { StatusCodes } = require('http-status-codes')
const { noForumFoundError } = require('../../errors/forumErrors/forumErrors')

const getAllForums = tryCatchWrapper(async (req, res) => {
    const page = parseInt(req.query.page) || 0
    const limit = parseInt(req.query.limit) || 10
    const skip = page * 10
    const pagesCount = Math.ceil((await Forum.countDocuments()) / 10)
    const forums = await Forum.find().skip(skip).limit(limit)
    if (!forums) {
        throw new noForumFoundError()
    }
    res.status(StatusCodes.OK).json({ pagesCount, forums })
    return
})

module.exports = getAllForums
