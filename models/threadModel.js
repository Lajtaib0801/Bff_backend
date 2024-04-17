const mongoose = require('mongoose')

const threadSchema = new mongoose.Schema({
    _id: {
        forum_id: {
            type: mongoose.ObjectId,
            required: true,
        },
        creator_id: {
            type: mongoose.ObjectId,
            required: true,
        },
        thread_id: {
            type: mongoose.ObjectId,
            auto: true,
        },
    },
    name: {
        type: String,
        required: true,
    },
    likes: {
        count: {
            type: Number,
            default: 0,
        },
        users: [String],
    },
    dislikes: {
        count: {
            type: Number,
            default: 0,
        },
        users: [String],
    },
    editors: [String],
    emoticons: [String],
    creation_date: {
        type: Date,
        default: Date.now,
    },
    content: {
        type: String,
        required: true,
    },
    image_array: [String],
})

module.exports = mongoose.model('Thread', threadSchema, 'Threads')
