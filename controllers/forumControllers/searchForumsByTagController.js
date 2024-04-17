const Forum = require('../../models/forumModel')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { StatusCodes } = require('http-status-codes')
const { noForumFoundError } = require('../../errors/forumErrors/forumErrors')

const searchForumByTag = tryCatchWrapper(async (req, res) => {
    const forums = await Forum.find({ tags: req.params.tag })
    if (!forums) {
        throw new noForumFoundError()
    }
    res.status(StatusCodes.OK).json(forums)
    return
})

module.exports = searchForumByTag
