const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const Chat = require('../../models/chatroomModel')
const User = require('../../models/userModel')
const Comment = require('../../models/commentModel')
const { StatusCodes } = require('http-status-codes')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')
const { notAllowedToDeleteChatError, noChatFoundError } = require('../../errors/chatErrors/chatErrors')

const deleteChat = tryCatchWrapper(async (req, res) => {
    const chatId = req.params.chatId
    const deleterUser = await getCreatorIdFromHeaders(req.headers)
    const deleter = await User.findById(deleterUser)
    const chat = await Chat.findOne({ _id: chatId })
    if (chat) {
        if ((JSON.stringify(chat.owner) == JSON.stringify(deleterUser) || deleter.role == 'admin') && chat.is_private) {
            await Chat.findByIdAndDelete(chatId)
            await User.updateMany({ chats: { $in: [chatId] } }, { $pull: { chats: chatId } })
            await Comment.deleteMany({ '_id.room_id': chatId })
            return res.status(StatusCodes.OK).json({ message: 'Chat deleted successfully.' })
        }
        throw new notAllowedToDeleteChatError()
    }
    throw new noChatFoundError()
})

module.exports = deleteChat
