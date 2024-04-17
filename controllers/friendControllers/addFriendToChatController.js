const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const User = require('../../models/userModel')
const { StatusCodes } = require('http-status-codes')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')
const Chatroom = require('../../models/chatroomModel')

const addFriendToChat = tryCatchWrapper(async (req, res) => {
    const { friend_name: friendName, chat_id: chatId } = req.body
    const id = await getCreatorIdFromHeaders(req.headers)
    const adder = await User.findById(id)
    const friend = await User.findOne({ username: friendName })
    if (!friend) {
        res.status(StatusCodes.NOT_FOUND).json({ message: 'No user found with name: ' + friendName })
    }
    const chat = await Chatroom.findById(chatId)
    if (!chat) {
        res.status(StatusCodes.NOT_FOUND).json({ message: 'No chat found!' })
    }
    for (const addersFriend of adder.friends) {
        if (JSON.stringify(addersFriend) == JSON.stringify(friend._id)) {
            for (const user of chat.users) {
                if (user.user_id.toString() == friend._id.toString()) {
                    res.status(StatusCodes.BAD_REQUEST).json({ message: 'You are already in this chat!' })
                    return
                }
            }
            chat.users.push({
                user_id: friend._id,
                is_moderator: false,
            })
            await chat.save()
            friend.chats.push(chat._id)
            await friend.save()
            res.status(StatusCodes.OK).json({ message: 'Friend added to chat' })
            return
        }
    }
    res.status(StatusCodes.NOT_FOUND).json({ message: 'You have no friend with name: ' + friendName })
    return
})

module.exports = addFriendToChat
