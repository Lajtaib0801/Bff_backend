const { getUserInfoFromToken } = require('../controllers/userControllers/userController')

const sendTokenResponse = async (user, statusCode, res) => {
    const token = user.getSignedJwtToken()

    const userInfo = await getUserInfoFromToken(token)
    res.status(statusCode).json({ success: true, userInfo, token: token })
    return
}

module.exports = sendTokenResponse
