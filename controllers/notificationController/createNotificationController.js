const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const User = require('../../models/userModel')
const { noUserFoundError } = require('../../errors/userErrors/userErrors')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')
const { StatusCodes } = require('http-status-codes')
const { notificationTextRequiredError } = require('../../errors/notificationErrors/notificationErrors')

const createNotification = tryCatchWrapper(async (req, res) => {
    const userId = await getCreatorIdFromHeaders(req.headers)
    const { text } = req.body.text
    let user = await User.findById(userId)
    if (!user) {
        throw new noUserFoundError()
    }
    if (!text || text.length == 0) {
        throw new notificationTextRequiredError()
    }
    user.notifications.push({ text: text })
    await user.save()
    res.status(StatusCodes.CREATED).json(user.notifications)
    return
})

module.exports = createNotification
