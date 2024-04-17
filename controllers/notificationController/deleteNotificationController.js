const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const User = require('../../models/userModel')
const { noUserFoundError } = require('../../errors/userErrors/userErrors')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')
const { StatusCodes } = require('http-status-codes')
const { notificationNotFoundError } = require('../../errors/notificationErrors/notificationErrors')

const deleteNotification = tryCatchWrapper(async (req, res) => {
    const userId = await getCreatorIdFromHeaders(req.headers)
    let user = await User.findById(userId)
    if (!user) {
        throw new noUserFoundError()
    }
    const notificationId = req.params.notificationId
    const notificationIndex = user.notifications.findIndex((notification) => notification.id.toString() == notificationId.toString())
    if (notificationIndex == -1) {
        throw new notificationNotFoundError()
    }
    user.notifications.splice(notificationIndex, 1)
    await user.save()
    res.status(StatusCodes.OK).json({ message: 'Notification deleted' })
    return
})

module.exports = deleteNotification
