const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const User = require('../../models/userModel')
const { StatusCodes } = require('http-status-codes')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')
const { noUserFoundError } = require('../../errors/userErrors/userErrors')
const nodemailer = require('nodemailer')
const crypro = require('crypto')
const fs = require('fs')

const changePassword = tryCatchWrapper(async (req, res) => {
    const userId = await getCreatorIdFromHeaders(req.headers)
    const user = await User.findById(userId)
    if (!user) {
        throw new noUserFoundError(userId)
    }
    const { old_passwd: oldPasswd, new_passwd: newPasswd, new_passwd2: newPasswd2 } = req.body
    if (!user.validPassword(user, oldPasswd)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'Your given password is not matching with the one in the database',
        })
    }
    if (newPasswd !== newPasswd2) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'New passwords do not match',
        })
    }
    user.reset_password_token = crypro.randomBytes(64).toString('hex')
    user.reset_password = user.generateHash(newPasswd)
    await user.save()
    await sendChangePasswordEmail(user.reset_password_token, user.email,user.username)
    return res.status(StatusCodes.OK).json({ message: `Password changing verification email sent to: ${user.email}!` })
})

const sendChangePasswordEmail = tryCatchWrapper(async (passwordToken, userEmail, userName) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS,
        },
    })
    const htmlContent = fs.readFileSync('change_password_template.html', 'utf8');
    var mailOptions = {
        from: { name: 'BlitzForFriends', address: process.env.EMAIL },
        to: userEmail,
        subject: 'Change Password',
        html: htmlContent
            .replace('{{verificationLink}}', `${process.env.FRONTEND_URL}/changepassword/${passwordToken}`)
            .replace('{{username}}', userName),
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent: ' + info.response)
        }
    })
})

module.exports = changePassword
