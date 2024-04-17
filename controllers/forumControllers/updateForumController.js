const Forum = require('../../models/forumModel')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { StatusCodes } = require('http-status-codes')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')
const {
    youCannotEditThisFieldError,
    forumNameTooLongError,
    forumNameIsTooShortError,
    forumDescriptionIsTooLongError,
    tagIsTooLongError
} = require('../../errors/forumErrors/forumErrors')

const updateForum = tryCatchWrapper(async (req, res) => {
    const userId = await getCreatorIdFromHeaders(req.headers)
    const forum = await Forum.findOne({ '_id.forum_id': req.params.forumId })
    let updated = 0
    let reqObj
    if (forum?._id.creator_id.toString() !== userId.toString()) {
        res.status(StatusCodes.NOT_FOUND).json({
            message: `You have no forum with id: ${req.params.forumId}`,
        })
        return
    }
    if (req.body.forum_name) {
        if (req.body.forum_name.length > 40) {
            throw new forumNameTooLongError()
        } else if (req.body.forum_name.length < 4) {
            throw new forumNameIsTooShortError()
        }
    }
    if (req.body.description && req.body.description.length > 5000) {
        throw new forumDescriptionIsTooLongError()
    }
    if (req.body._id) {
        throw new youCannotEditThisFieldError()
    }
    if (req.body.creator_id) {
        throw new youCannotEditThisFieldError()
    }
    if (req.body.creation_date) {
        throw new youCannotEditThisFieldError()
    }
    if (req.body.blacklist) {
        throw new youCannotEditThisFieldError()
    }
    if (req.body.users) {
        throw new youCannotEditThisFieldError()
    }
    if (req.body.rating) {
        throw new youCannotEditThisFieldError()
    }
    if (req.body.topthread) {
        throw new youCannotEditThisFieldError()
    }
    if (req.body.tags) {
        for (const tag of req.body.tags) {
            if (tag.length > 15) {
                throw new tagIsTooLongError()
            }
        }
        updated += (
            await Forum.updateOne(
                { '_id.forum_id': req.params.forumId },
                {
                    $addToSet: {
                        tags: {
                            $each: req.body.tags,
                        },
                    },
                }
            )
        ).modifiedCount
        reqObj = req.body
        delete reqObj.tags
    }
    updated += (await Forum.updateOne({ '_id.forum_id': req.params.forumId }, req.body)).modifiedCount ?? 0
    if (updated == 0) {
        res.status(StatusCodes.NOT_MODIFIED).json({
            message: `No changes were made to the forum with id: ${req.params.forumId}`,
        })
        return
    }
    res.status(StatusCodes.OK).json({
        message: 'Forum updated',
    })
})

module.exports = updateForum
