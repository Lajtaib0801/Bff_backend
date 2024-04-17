const Forum = require('../../models/forumModel')
const User = require('../../models/userModel')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { StatusCodes } = require('http-status-codes')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')
const { noUserFoundError } = require('../../errors/userErrors/userErrors')
const { noForumFoundError, youAreNotInThisForumError } = require('../../errors/forumErrors/forumErrors')

const leaveForum = tryCatchWrapper(async (req, res) => {
    const { forum_id: forumId } = req.body
    const id = await getCreatorIdFromHeaders(req.headers)
    const user = await User.findById(id)
    if (!user) {
        throw new noUserFoundError(id)
    }
    let forum = await Forum.findOne({ '_id.forum_id': forumId })
    if (!forum) {
        throw new noForumFoundError()
    }
    for (let i = 0; i < forum.users.length; i++) {
        if (forum.users[i].user_id.toString() == id.toString()) {
            forum.users.splice(i, 1)
            await forum.save()
            res.status(StatusCodes.OK).json({
                message: 'Forum left successfully!',
            })
            return
        }
    }
    if (forum._id.creator_id.toString() == id.toString()) {
        if (forum.users.length == 0) {
            await Forum.deleteOne({ _id: forumId })
            res.status(StatusCodes.OK).json({
                message: 'Forum left successfully!',
            })
            return
        }
        else {
            forum._id.creator_id = forum.users[0].user_id
            forum.users.shift()
            await forum.save()
            res.status(StatusCodes.OK).json({
                message: 'Forum left successfully!',
            })
            return
        }
    }
    throw new youAreNotInThisForumError()
})

module.exports = leaveForum