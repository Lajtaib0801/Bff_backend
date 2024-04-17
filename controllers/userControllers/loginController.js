const User = require('../../models/userModel')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { StatusCodes } = require('http-status-codes')
const sendTokenResponse = require('../../middlewares/sendTokenResponse')
const { userIsAlreadyLoggedInError, wrongLoginDataError } = require('../../errors/userErrors/userErrors')

const loginUser = tryCatchWrapper(async (req, res) => {
    if (req.cookies['token'] || req.headers.authorization) {
        if (req.headers.authorization != 'Bearer null') {
            throw new userIsAlreadyLoggedInError()
        }
    }
    if (req.body.email.includes('_')) {
        if (req.body.email.split('_')[0] == 'deleteduser') {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'You cannot login to deleted user' })
            return
        }
    }
    const user = await User.findOne({ email: req.body.email })
    if (!user || !user.validPassword(user, req.body.password)) {
        throw new wrongLoginDataError()
    }
    if (!user.isVerified && user.emailToken) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: 'Please verify your email address' })
        return
    }
    sendTokenResponse(user, StatusCodes.OK, res)
    return
})

module.exports = loginUser
