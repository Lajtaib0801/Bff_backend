const Forum = require('../../models/forumModel')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { StatusCodes } = require('http-status-codes')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')
const { forumAlreadyExistsError, noForumNameGivenError, forumNameTooLongError, forumNameIsTooShortError, tagIsTooLongError } = require('../../errors/forumErrors/forumErrors')

const createForum = tryCatchWrapper(async (req, res) => {
    const { forum_name: forumName, banner: banner, tags: tags, description: description } = req.body
    if (!forumName) {
        throw new noForumNameGivenError()
    }
    if (forumName.length < 4) {
        throw new forumNameIsTooShortError()
    }
    if (forumName.length > 40) {
        throw new forumNameTooLongError()
    }
    for (const tag of tags) {
        if (tag.length > 15) {
            throw new tagIsTooLongError()
        }
    }
    if (await Forum.findOne({ forum_name: forumName })) throw new forumAlreadyExistsError(forumName)
    const decodedCreatorId = await getCreatorIdFromHeaders(req.headers)
    let newForum = new Forum({
        _id: {
            creator_id: decodedCreatorId,
        },
        forum_name: forumName,
        banner: banner,
        tags: [...new Set(tags)],
        description: description,
    })
    newForum.save()
    res.status(StatusCodes.CREATED).json({ success: true, forumId: newForum._id.forum_id })
    return
})

module.exports = createForum
