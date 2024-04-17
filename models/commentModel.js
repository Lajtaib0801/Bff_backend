const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    _id: {
        room_id: {
            type: mongoose.ObjectId,
            ref: 'Chatroom',
            required: true,
        },
        creator_id: {
            type: mongoose.ObjectId,
            required: true,
            ref: 'User',
        },
        message_id: {
            type: mongoose.ObjectId,
            auto: true,
        },
    },

    text: {
        type: String,
        maxlength: [2000, 'A comment cannot be longer than 2000 characters!'],
        required: true,
    },
    reply: {
        is_reply: {
            type: Boolean,
            default: false,
        },
        parent_comment_id: {
            type: mongoose.ObjectId,
            default: null,
        },
        sequential_number: {
            type: Number,
            default: 0,
        },
    },

    creation_date: {
        type: Date,
        default: Date.now,
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
    emoticons: [String],
})

module.exports = mongoose.model('Comment', commentSchema, 'Comments')
