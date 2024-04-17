const Chat = require('../../models/chatroomModel')
const { StatusCodes } = require('http-status-codes')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { noChatFoundError } = require('../../errors/chatErrors/chatErrors')

const getChatDataById = tryCatchWrapper(async (req, res) => {
    const chat = await Chat.findById(req.params.chatId)
    if (!chat) {
        throw new noChatFoundError(req.params.chatId)
    }
    res.status(StatusCodes.OK).json({ chat })
    return
})

module.exports = getChatDataById
