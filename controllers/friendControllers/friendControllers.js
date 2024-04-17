const getFriends = require('./getFriendsController')
const deleteFriend = require('./deleteFriendController')
const makeFriendRequest = require('./makeFriendRequestController')
const acceptFriendRequest = require('./acceptFriendRequestController')
const declineFriendRequest = require('./declineFriendRequestController')
const addFriendToChat = require('./addFriendToChatController')

module.exports = {
    getFriends,
    deleteFriend,
    makeFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    addFriendToChat,
}
