const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const Chat = require('../../models/chatroomModel')
const User = require('../../models/userModel')
const { StatusCodes } = require('http-status-codes')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')
const { daysToDieError, usersAlreadyHaveMutualPrivateChatroomError } = require('../../errors/chatErrors/chatErrors')
const { noUserFoundError } = require('../../errors/userErrors/userErrors')

const createChat = tryCatchWrapper(async (req, res) => {
    let { name: name, is_ttl: isTtl, days_to_die: daysToDie, is_private: isPrivate, usernames: usernames } = req.body
    const decodedCreatorId = await getCreatorIdFromHeaders(req.headers)
    for (const username of usernames) {
        let otherUser = await User.findOne({ username: username })
        if (!otherUser) {
            throw new noUserFoundError(username)
        }
        if (isPrivate) {
            if (await hasMutualPrivateChat(decodedCreatorId, otherUser._id)) {
                throw new usersAlreadyHaveMutualPrivateChatroomError()
            }
        }
    }
    const expirationDate = await setExpirationDate(isTtl, daysToDie)
    let newChat = new Chat({
        name: name,
        owner: decodedCreatorId,
        time_to_live: {
            is_ttl: isTtl,
        },
        is_private: isPrivate,
    })
    if (expirationDate != null) {
        newChat.time_to_live.expiration = expirationDate
    }
    await newChat.save()

    let creatorUser = await User.findById(decodedCreatorId)
    creatorUser.chats.push(newChat._id)
    await creatorUser.save()
    if (isPrivate) {
        let otherUser = await User.findOne({ username: usernames[0] })
        otherUser.chats.push(newChat._id)
        await otherUser.save()
        newChat.users.push({ user_id: otherUser._id, is_moderator: true })
        await newChat.save()
    } else {
        for (const username of usernames) {
            let otherUser = await User.findOne({ username: username })
            newChat.users.push({ user_id: otherUser._id, is_moderator: false })
            otherUser.chats.push(newChat._id)
            await otherUser.save()
        }
        await newChat.save()
    }
    res.status(StatusCodes.CREATED).json({ roomId: newChat._id })
    return
})

const setExpirationDate = tryCatchWrapper((ttl, daysToDie) => {
    if (ttl === true) {
        if (daysToDie < 1 && !Number.isInteger(daysToDie)) {
            throw new daysToDieError()
        }
        let expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + daysToDie)
        return expirationDate
    }
    return null
})

const hasMutualPrivateChat = tryCatchWrapper(async (decodedCreatorId, otherUserId) => {
    const myChats = (await User.findById(decodedCreatorId).select('chats -_id')).chats
    const otherChats = (await User.findById(otherUserId).select('chats -_id')).chats
    for (const chatId of myChats) {
        if (otherChats.includes(chatId) && (await Chat.findById(chatId)).is_private === true) {
            return true
        }
    }
    return false
})

module.exports = createChat
