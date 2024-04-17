const User = require('../../models/userModel')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { noUserFoundError } = require('../../errors/userErrors/userErrors')
const { StatusCodes } = require('http-status-codes')
const jwt = require('jsonwebtoken')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')

const updaterOptions = {
    new: true,
    runValidators: true,
}

const getAllUsers = tryCatchWrapper(async (req, res) => {
    const users = await User.find().select('-email -_id')
    if (!users) {
        res.status(StatusCodes.NOT_FOUND).json({ message: 'No user found' })
        return
    }
    res.status(StatusCodes.OK).json({ users })
    return
})

const getUserDataById = tryCatchWrapper(async (req, res) => {
    const user = req.user
    if (!user) throw new noUserFoundError(userId)
    res.status(StatusCodes.OK).json({ user })
})

const getUserInfoFromToken = tryCatchWrapper(async (token) => {
    const userId = jwt.verify(token, process.env.JWT_SECRET).id
    const userInformation = await User.findById(userId)
    if (!userInformation) throw new noUserFoundError(userId)
    const userInfoObject = {
        profile_image: userInformation.profile_image,
        custom_ui: userInformation.custom_ui,
        role: userInformation.role,
        username: userInformation.username,
        created_at: userInformation.created_at,
        full_name: userInformation.full_name,
    }
    return userInfoObject
})

const getUserProfileByUsername = tryCatchWrapper(async (req, res) => {
    const { username: username } = req.params
    const user = await User.findOne({ username: username }).select('-email -password')
    if (!user) throw new noUserFoundError(username)
    res.status(StatusCodes.OK).json({ user })
    return
})

const updateUser = tryCatchWrapper(async (req, res) => {
    const userId = await getCreatorIdFromHeaders(req.headers)
    if (req.body.username && req.body.username.length < 2) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: 'Username must be at least 2 characters long' })
        return
    }
    if (req.body.username && req.body.username.length > 20) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: 'Username cannot be longer than 20 characters!' })
        return
    }
    if (/^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/.test(req.body.username) === false) {
        res.status(StatusCodes.BAD_REQUEST).json({
            message: 'Username must start with a letter and can only contain letters, numbers, dashes and underscores',
        })
        return
    }
    if (req.body.full_name && req.body.full_name.length < 5) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: 'Full name must be at least 5 characters long' })
        return
    }
    if (req.body.full_name && req.body.full_name.length > 100) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: 'Full name cannot be longer than 100 characters!' })
        return
    }
    if (req.body.description && req.body.description.length > 5000) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: 'Description cannot be longer than 5000 characters!' })
        return
    }
    const user = await User.findByIdAndUpdate(userId, req.body, updaterOptions).select('-email -_id -password')
    if (!user) throw new noUserFoundError(userId)
    res.status(StatusCodes.OK).json({ user })
    return
})

const deleteUser = tryCatchWrapper(async (req, res) => {
    const userId = await getCreatorIdFromHeaders(req.headers)
    const user = await User.findById(userId)
    if (!user) throw new noUserFoundError(userId)
    if (!user.validPassword(user, req.headers.password)) {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Wrong password' })
        return
    }
    const deletedUsername =
        'deletedUser_' + (await User.find({ username: { $regex: `^deletedUser`, $options: 'i' } })).length + 10
    user.username = deletedUsername
    user.generateHash(generateRandomString(10) + 'Pass12345%!')
    user.full_name = 'Deleted User'
    user.profile_image = ''
    user.custom_ui = false
    user.email = deletedUsername + '@' + deletedUsername + '.com'
    user.friend_requests = []
    user.contacts = []
    user.hobbies = []
    await user.save()
    res.status(StatusCodes.OK).json({ message: 'User deleted successfully' })
    return
})

const addHobby = tryCatchWrapper(async (req, res) => {
    const userId = await getCreatorIdFromHeaders(req.headers)
    const user = await User.findById(userId)
    if (!user) throw new noUserFoundError(userId)
    const hobbies = req.body.hobbies
    for (const hobby of hobbies) {
        user.hobbies.push(hobby)
    }
    await user.save()
    res.status(StatusCodes.OK).json({ message: 'Hobby or hobbies added' })
    return
})

const getUserRequests = tryCatchWrapper(async (req, res) => {
    const userId = await getCreatorIdFromHeaders(req.headers)
    const user = await User.findById(userId)
    if (!user) throw new noUserFoundError(userId)
    const requests = user.friend_requests
    const requestsPageCount = Math.ceil(requests.length / 10)
    const page = parseInt(req.query.page) || 0
    const limit = parseInt(req.query.limit) || 10
    const skip = page * 10
    const returnRequests = requests.slice(skip, skip + limit)
    res.status(StatusCodes.OK).json({ requestsPageCount, returnRequests })
    return
})

const getUsersSentRequests = tryCatchWrapper(async (req, res) => {
    const userId = await getCreatorIdFromHeaders(req.headers)
    const user = await User.findById(userId)
    if (!user) throw new noUserFoundError(userId)
    const sentRequests = user.sent_friend_requests
    res.status(StatusCodes.OK).json({ sentRequests })
    return
})

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
    const specialChar = chars[Math.floor(Math.random() * (chars.length - 10)) + 52]
    let password = ''
    for (let i = 0; i < length - 1; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    password += specialChar
    return password
}

module.exports = {
    getAllUsers,
    getUserDataById,
    updateUser,
    deleteUser,
    getUserInfoFromToken,
    getUserProfileByUsername,
    addHobby,
    getUserRequests,
    getUsersSentRequests,
}
