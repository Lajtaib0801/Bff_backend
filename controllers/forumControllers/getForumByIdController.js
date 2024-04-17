const Forum = require('../../models/forumModel')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { StatusCodes } = require('http-status-codes')
const { noForumFoundError } = require('../../errors/forumErrors/forumErrors')

const getForumById = tryCatchWrapper(async (req, res) => {
    const forum = await Forum.findOne({ '_id.forum_id': req.params.forumId })
    if (!forum) {
        throw new noForumFoundError()
    }
    res.status(StatusCodes.OK).json([forum])
    return
})

module.exports = getForumById
