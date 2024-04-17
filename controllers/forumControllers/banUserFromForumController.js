const Forum = require('../../models/forumModel')
const User = require('../../models/userModel')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { StatusCodes } = require('http-status-codes')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')
const { noForumFoundError, notAuthorizedToBanUsersFromForumError, userIsAlreadyBannedFromForumError } = require('../../errors/forumErrors/forumErrors')

const banUserFromForum = tryCatchWrapper(async (req, res) => {
    const forum = await Forum.findOne({ '_id.forum_id': req.body.forum_id })
    if (!forum) {
        throw new noForumFoundError()
    }
    const bannerId = await getCreatorIdFromHeaders(req.headers)
    if (bannerId != forum._id.creator_id.toString() && (await User.findById(bannerId).role) != 'admin') {
        throw new notAuthorizedToBanUsersFromForumError()
    }
    const userName = req.body.user_name
    const userId = (await User.findOne({ username: userName }))._id
    if (forum.blacklist.includes(userId)) {
        throw new userIsAlreadyBannedFromForumError()
    }
    forum.blacklist.push(userId)
    await forum.save()
    res.status(StatusCodes.OK).json({
        message: 'User banned from forum',
    })
    return
})

module.exports = banUserFromForum
