const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const User = require('../../models/userModel')
const { StatusCodes } = require('http-status-codes')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')
const { noUserFoundError } = require('../../errors/userErrors/userErrors')
const nodemailer = require('nodemailer')

const confirmPasswordChange = tryCatchWrapper(async (req, res) => {
    const passwordToken = req.params.passwordToken
    if (!passwordToken) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: 'Password token is required' })
        return
    }
    const user = await User.findOne({ reset_password_token: passwordToken })
    if (!user) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: 'Password token is invalid' })
        return
    }
    user.password = user.reset_password
    user.reset_password_token = null
    user.reset_password = null
    await user.save()
    res.status(StatusCodes.OK).json({ message: 'Password changed successfully' })
    return
})

module.exports = confirmPasswordChange
