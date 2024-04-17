const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const User = require('../../models/userModel')
const { StatusCodes } = require('http-status-codes')
const { userDoesNotHaveChatsYetError } = require('../../errors/userErrors/userErrors')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')

const getUsersChats = tryCatchWrapper(async (req, res) => {
    const id = await getCreatorIdFromHeaders(req.headers)
    let chats = await User.findById(id).populate('chats').select('chats -_id')
    if (!chats) {
        res.status(StatusCodes.NOT_FOUND).json({
            message: `No user found with this id: '${id}'`,
        })
    }
    const myName = (await User.findById(id)).username
    const privateChats = []
    const publicChats = []

    for (const element of chats.chats) {
        if (element.is_private) {
            privateChats.push({
                _id: element._id,
                name: element.name,
                is_private: element.is_private,
                friend_user_name:
                    (await User.findById(element.users[0].user_id)).username != myName
                        ? (await User.findById(element.users[0].user_id)).username
                        : (await User.findById(element.owner)).username,
            })
        } else {
            publicChats.push({
                _id: element._id,
                name: element.name,
                is_private: element.is_private,
            })
        }
    }
    const privatePage = parseInt(req.query.private_page) || 0
    const privateLimit = parseInt(req.query.private_limit) || 10
    const privateSkip = privatePage * privateLimit
    const privateChatsCount = Math.ceil(privateChats.length / 10)
    const retPrivChats = privateChats.splice(privateSkip, privateLimit)

    const publicPage = parseInt(req.query.public_page) || 0
    const publicLimit = parseInt(req.query.public_limit) || 10
    const publicSkip = publicPage * publicLimit
    const publicChatsCount = Math.ceil(publicChats.length / 10)
    const retPubChats = publicChats.splice(publicSkip, publicLimit)

    const returnArray = retPrivChats.concat(...retPubChats)
    res.status(StatusCodes.OK).json({ privateChatsCount, publicChatsCount, returnArray })
    return
})

module.exports = getUsersChats
