const mongoose = require('mongoose')
const tryCatchWrapper = require('../middlewares/tryCatchWrapper')
const Comment = require('./commentModel')
const Chatroom = require('./chatroomModel')
const User = require('./userModel')

const chatroomSchema = new mongoose.Schema({
    _id: {
        type: mongoose.ObjectId,
        auto: true,
    },
    name: {
        type: String,
        required: true,
    },
    is_private: {
        type: Boolean,
        required: true,
    },
    users: [
        {
            _id: false,
            user_id: {
                type: mongoose.ObjectId,
                ref: 'User',
                required: true,
            },
            is_moderator: {
                type: Boolean,
                default: false,
            },
        },
    ],
    common_topics: [String],
    owner: {
        type: mongoose.ObjectId,
        required: true,
    },
    time_to_live: {
        is_ttl: {
            type: Boolean,
            required: true,
        },
        expiration: {
            type: Date,
            default: '2999-01-01',
        },
    },
})

chatroomSchema.virtual('getUsers', {
    ref: 'User',
    localField: 'users.user_id',
    foreignField: '_id',
    justOne: false,
})

module.exports = mongoose.model('Chatroom', chatroomSchema, 'Chatrooms')
