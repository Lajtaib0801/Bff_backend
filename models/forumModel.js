const mongoose = require('mongoose')
const tryCatchWrapper = require('../middlewares/tryCatchWrapper')

const forumSchema = new mongoose.Schema({
    _id: {
        creator_id: {
            type: mongoose.ObjectId,
            required: true,
        },
        forum_id: {
            type: mongoose.ObjectId,
            auto: true,
        },
    },
    description: {
        type: String,
        maxlength: [5000, 'The description cannot be more than 5000 characters!'],
        trim: true,
    },
    forum_name: {
        type: String,
        required: true,
        unique: true,
        maxlength: [40, 'The forum name cannot be more than 40 characters!'],
        minlength: [4, 'The forum name cannot be less than 4 characters!'],
    },
    creation_date: {
        type: Date,
        default: Date.now,
    },
    banner: {
        type: String,
    },
    blacklist: [mongoose.ObjectId],
    users: [
        {
            user_id: {
                type: mongoose.ObjectId,
            },
            is_moderator: {
                type: Boolean,
                default: false,
            },
        },
    ],
    rating: {
        type: Number,
        default: 0,
    },
    tags: [String],
    topthread: {
        type: mongoose.ObjectId,
    },
})

forumSchema.statics.getForumIdByName = tryCatchWrapper(async function (forumName) {
    const Forum = mongoose.model('Forum', forumSchema, 'Forums')
    const id = await Forum.aggregate([
        {
            $match: { forum_name: forumName },
        },
        {
            $project: {
                _id: 0,
                forum_id: '$_id.forum_id',
            },
        },
    ])
    return id[0].forum_id
})

module.exports = mongoose.model('Forum', forumSchema, 'Forums')
