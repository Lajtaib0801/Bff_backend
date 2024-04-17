const Forum = require('../../models/forumModel')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { StatusCodes } = require('http-status-codes')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')
const { noForumFoundError, notAuthorizedToDeleteForumError } = require('../../errors/forumErrors/forumErrors')
const User = require('../../models/userModel')

const deleteForum = tryCatchWrapper(async (req, res) => {
    const forum = await Forum.findOne({ forum_name: req.headers.forumname })
    if (!forum) {
        throw new noForumFoundError()
    }
    const id = await getCreatorIdFromHeaders(req.headers)
    if (id != forum._id.creator_id.toString() && (await User.findById(id).role) != 'admin') {
        throw new notAuthorizedToDeleteForumError()
    }
    await Forum.findByIdAndDelete(forum._id)
    res.status(StatusCodes.OK).json({
        message: 'Forum deleted',
    })
    return
})

module.exports = deleteForum
