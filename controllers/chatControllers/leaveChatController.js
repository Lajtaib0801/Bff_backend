const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const User = require('../../models/userModel')
const Chat = require('../../models/chatroomModel')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')
const { StatusCodes } = require('http-status-codes')
const { youAreNotInThisChatError } = require('../../errors/chatErrors/chatErrors')

const updaterOptions = {
    new: true,
    runValidators: true,
}
const leaveChat = tryCatchWrapper(async (req, res) => {
    const { chat_id: chatId } = req.body
    const decodedId = await getCreatorIdFromHeaders(req.headers)
    const user = await User.findById(decodedId)
    let chat = await Chat.findById(chatId)
    if (user.chats.map((chat) => chat.toString()).includes(chatId)) {
        if (chat.owner.toString() != decodedId.toString()) {
            user.chats.pull(chatId)
            await user.save()
            chat = await Chat.updateOne({ _id: chatId }, { $pull: { users: { user_id: decodedId } } }, updaterOptions)
            res.status(StatusCodes.OK).json({
                message: 'Chat left successfully!'
            })
            return
        }
        if (chat.users.length == 0) {
            await Chat.deleteOne({ _id: chatId })
            user.chats.pull(chatId)
            await user.save()
            res.status(StatusCodes.OK).json({
                message: 'Chat left successfully!',
            })
            return
        }
        chat.owner = chat.users[0].user_id
        chat.users.shift()
        await chat.save()
        user.chats.pull(chatId)
        await user.save()
        res.status(StatusCodes.OK).json({
            message: 'Chat left successfully!',
        })
        return
    }
    throw new youAreNotInThisChatError()
})

module.exports = leaveChat
