const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const User = require('../../models/userModel')
const { noUserFoundError } = require('../../errors/userErrors/userErrors')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')
const { StatusCodes } = require('http-status-codes')

const getUsersNotifications = tryCatchWrapper(async (req, res) => {
    const userId = await getCreatorIdFromHeaders(req.headers)
    const user = await User.findById(userId)
    if (!user) {
        throw new noUserFoundError()
    }
    let notifications = user.notifications.reverse()
    const notificationsPageCount = Math.ceil(notifications.length / 10)
    const page = req.query.page || 0
    const limit = req.query.limit || 10
    const skip = page * 10
    notifications = notifications.slice(skip, limit)
    res.status(StatusCodes.OK).json({ notificationsPageCount, notifications })
    return
})

module.exports = getUsersNotifications
