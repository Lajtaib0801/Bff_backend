const User = require('../../models/userModel')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { userAlreadyExistsError, userIsAlreadyLoggedInError } = require('../../errors/userErrors/userErrors')
const { StatusCodes } = require('http-status-codes')
const sendTokenResponse = require('../../middlewares/sendTokenResponse')
const crypro = require('crypto')
const nodemailer = require('nodemailer')
const fs = require('fs')

const registerUser = tryCatchWrapper(async (req, res) => {
    if (req.cookies['token'] || req.headers.authorization) {
        if (req.headers.authorization != 'Bearer null') {
          throw new userIsAlreadyLoggedInError()
        }
    }
    if (req.body.username.length > 20) {
        res.status(StatusCodes.CONFLICT).json({ message: 'Username is too long' })
        return
    }
    if (req.body.username.length < 2) {
        res.status(StatusCodes.CONFLICT).json({ message: 'Username is too short' })
        return
    }
    if (req.body.username === 'deletedUser' || req.body.username.split('_')[0] === 'deletedUser') {
        res.status(StatusCodes.CONFLICT).json({ message: 'You cannot register with deletedUser username' })
        return
    }
    if (await User.findOne({ username: req.body.username })) {
        throw new userAlreadyExistsError(req.body.username)
    }
    if (await User.findOne({ email: req.body.email })) {
        throw new userAlreadyExistsError(req.body.email)
    }
    let newUser = new User({
        email: req.body.email,
        username: req.body.username,
        emailToken: crypro.randomBytes(64).toString('hex'),
    })
    newUser.password = newUser.generateHash(req.body.password)
    await newUser.save()
    await sendRegisterEmail(newUser.email, newUser.emailToken,newUser.username)
    sendTokenResponse(newUser, StatusCodes.CREATED, res)
})

const verifyEmail = tryCatchWrapper(async (req, res) => {
    const emailToken = req.params.emailToken
    if (!emailToken) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email token is required' })
        return
    }
    const user = await User.findOne({ emailToken })
    if (!user) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid email token' })
        return
    }
    user.emailToken = null
    user.isVerified = true
    await user.save()
    res.status(StatusCodes.OK).json({ message: 'Email verified successfully' })
})

const sendRegisterEmail = tryCatchWrapper(async (userEmail, emailToken, userName) => {
    var transporter 
    if (process.env.NODE_ENV === 'testing') {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: 2525,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS,
            },
        })
    }
    else {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            host: process.env.EMAIL_HOST,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS,
            },
        })
    }
    const htmlContent = fs.readFileSync('email_template.html', 'utf8');
    var mailOptions = {
        from: { name: 'BlitzForFriends', address: process.env.EMAIL },
        to: userEmail,
        subject: 'Verify your email',
        html: htmlContent
            .replace('{{verificationLink}}', `${process.env.FRONTEND_URL}/verifyEmail/${emailToken}`)
            .replace('{{username}}', userName),
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent: ' + info.response)
        }
    })
    if (process.env.NODE_ENV === 'testing') {
        await new Promise((r) => setTimeout(r, 1000))
    }
    return
})

module.exports = { registerUser, verifyEmail }
