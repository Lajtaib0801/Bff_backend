const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    full_name: {
        type: String,
        maxlength: [100, 'The fullname cannot be more than 100 characters!'],
        minlength: [5, 'The fullname cannot be less than 5 characters'],
        trim: true,
        match: [
            /(^[a-zA-ZÖÜÓÚŐŰÁÉÍöüóőúűáéí\-\']{0,20}[a-zA-ZÖÜÓÚŐŰÁÉÍöüóőúűáéí\-\']{2,20}\s[a-zA-ZÖÜÓÚŐŰÁÉÍöüóőúűáéí]{2,20}[\sa-zA-ZÖÜÓÚŐŰÁÉÍöüóőúűáéí\-\']{0,20}$)/,
            'Add a valid name!',
        ],
    },
    chats: [
        {
            type: mongoose.ObjectId,
            ref: 'Chatroom',
        },
    ],
    notifications: [
        {
            id: {
                type: mongoose.ObjectId,
                auto: true,
            },
            text: String,
            seen: {
                type: Boolean,
                default: false,
            },
        },
    ],
    description: {
        type: String,
        maxlength: [5000, 'The description cannot be more than 5000 characters!'],
        trim: true,
        default: '',
    },
    email: {
        type: String,
        required: [true, 'To add email is required!'],
        unique: true,
        match: [/[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}/gim, 'Please add a valid email address!'],
    },
    profile_image: {
        type: String,
        default: 'default',
        trim: true,
    },
    role: {
        type: String,
        default: 'user',
        trim: true,
        enum: ['user', 'admin'],
    },
    username: {
        type: String,
        required: true,
        minlength: [2, 'Username should be at least 2 characters!'],
        maxlength: [20, 'Username cannot be longer than 20 characters!'],
        trim: true,
        unique: true,
        match: [
            /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/,
            'Username must start with a letter and can only contain letters, numbers, dashes and underscores',
        ],
    },
    friends: [mongoose.ObjectId],
    password: {
        type: String,
        required: true,
        minlength: [8, 'Password should be at least 8 characters!'],
        trim: true,
        match: [
            /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/,
            'Strong password is required! (Min. 8 characters long, contains uppercase and lowercase letters, spec. character and numerals)',
        ],
    },
    friend_requests: [String],
    sent_friend_requests: [String],
    created_at: {
        type: Date,
        default: Date.now,
    },
    contacts: {
        type: Map,
        of: String,
    },
    hobbies: [String],
    reset_password_token: String,
    reset_password: String,
    isVerified: {
        type: Boolean,
        default: false,
    },
    emailToken: String,
})
userSchema.methods.generateHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}

userSchema.methods.validPassword = (user, password) => {
    try {
        return bcrypt.compareSync(password, user.password)
    } catch (error) {
        console.log(error)
    }
}

userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    })
}

userSchema.virtual('getChatrooms', {
    ref: 'Chatroom',
    localField: 'chats',
    foreignField: 'users.user_id',
    justOne: false,
})
module.exports = mongoose.model('User', userSchema, 'Users')
