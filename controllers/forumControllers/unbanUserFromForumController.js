const Forum = require('../../models/forumModel')
const User = require('../../models/userModel')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { StatusCodes } = require('http-status-codes')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')
const { noForumFoundError } = require('../../errors/forumErrors/forumErrors')

const unbanUserFromForum = tryCatchWrapper(async (req, res) => {
    const forum = await Forum.findOne({ '_id.forum_id': req.body.forum_id })
    if (!forum) {
        throw new noForumFoundError()
    }
    const unbannerId = await getCreatorIdFromHeaders(req.headers)
    if (unbannerId != forum._id.creator_id.toString() && (await User.findById(unbannerId).role) != 'admin') {
        res.status(StatusCodes.UNAUTHORIZED).json({
            message: 'You are not authorized to unban users from this forum',
        })
        return
    }
    const userName = req.body.user_name
    const userId = (await User.findOne({ username: userName }))._id.toString()
    if (!forum.blacklist.includes(userId)) {
        res.status(StatusCodes.BAD_REQUEST).json({
            message: 'User is not banned from this forum',
        })
        return
    }
    forum.blacklist.splice(forum.blacklist.indexOf(userId), 1)
    await forum.save()
    res.status(StatusCodes.OK).json({
        message: 'User unbanned from forum',
    })
})

module.exports = unbanUserFromForum