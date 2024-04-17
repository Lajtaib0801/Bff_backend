const daysToDieError = require('./daysToDieError')
const noChatFoundError = require('./noChatFoundError')
const chatShallBeCreatedError = require('./chatShouldShallBeCreatedError')
const usersAlreadyHaveMutualPrivateChatroomError = require('./usersAlreadyHaveMutualPrivateChatroomError')
const youAreNotInThisChatError = require('./youAreNotInThisChatError')
const notAllowedToDeleteChatError = require('./notAllowedToDeleteChatError')

module.exports = {
    daysToDieError,
    noChatFoundError,
    chatShallBeCreatedError,
    usersAlreadyHaveMutualPrivateChatroomError,
    youAreNotInThisChatError,
    notAllowedToDeleteChatError,
}
