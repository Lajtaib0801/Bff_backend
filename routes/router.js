const express = require('express')
const router = express.Router()
const limiter = require('express-rate-limit')
const { StatusCodes } = require('http-status-codes')
const {
    loginUser,
    registerUser: { registerUser, verifyEmail },
    getUsersChats,
    changePassword,
    confirmPasswordChange,
    userController: {
        getAllUsers,
        getUserDataById,
        updateUser,
        deleteUser,
        getUserInfoFromToken,
        getUserProfileByUsername,
        addHobby,
        getUserRequests,
        getUsersSentRequests,
    },
} = require('../controllers/userControllers/userControllers')
const protectPath = require('../middlewares/protectPath')
const checkWetherBannedFromForum = require('../middlewares/checkWetherBannedFromForum')
const {
    createForum,
    getAllThreadsByForumId,
    getAllForums,
    getForumById,
    searchForumByTag,
    deleteForum,
    banUserFromForum,
    unbanUserFromForum,
    updateForum,
    recommendForums,
    leaveForum,
    subscribeToForum,
} = require('../controllers/forumControllers/forumControllers')
const search = require('../controllers/searchController/searchController')
const {
    createThread,
    deleteThreadConroller,
    likeDislikeStateChanged,
    getThreadById,
    updateThread,
    createCommentToThread,
    getThreadsComments,
    deleteThreadComment
} = require('../controllers/threadControllers/threadControllers')
const {
    getChatDataById,
    createChat,
    checkMutualChat,
    getChatsComments,
    deleteChat,
    leaveChat,
} = require('../controllers/chatControllers/chatControllers')
const { createComment, updateComment, deleteComment } = require('../controllers/commentControllers/commentControllers')
const {
    getFriends,
    deleteFriend,
    makeFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    addFriendToChat,
} = require('../controllers/friendControllers/friendControllers')

const {
    createNotification,
    deleteNotification,
    getUsersNotifications,
    updateNotification,
} = require('../controllers/notificationController/notificationsController')

let maxLoginAttempts

if (process.env.NODE_ENV === 'testing') {
    maxLoginAttempts = 100
} else {
    maxLoginAttempts = 5
}

const loginLimiter = limiter({
    windowMs: 1000 * 60,
    max: maxLoginAttempts,
    handler: (req, res) => {
        res.status(StatusCodes.TOO_MANY_REQUESTS).json({ message: 'Too many login requests! Please try again after a minute.' })
    },
})

router.route('/register').post(registerUser)
router.route('/login').post(loginLimiter, loginUser)
router.route('/verifyEmail/:emailToken').get(verifyEmail)

router.route('/search').post(search)

router.route('/user').put(protectPath, updateUser).delete(protectPath, deleteUser)
router.route('/user/friends/requests').get(protectPath, getUserRequests)
router.route('/user/friends/sentRequests').get(protectPath, getUsersSentRequests)
router.route('/user/changePassword').post(protectPath, changePassword)
router.route('/user/verifyNewPassword/:passwordToken').get(confirmPasswordChange)
router.route('/user/:username').get(getUserProfileByUsername)
router.route('/user/addHobby').post(protectPath, addHobby)

router.route('/forum').get(getAllForums).post(protectPath, createForum).delete(protectPath, deleteForum)
router.route('/forum/getAllThreads/:forumId').get(checkWetherBannedFromForum, getAllThreadsByForumId)
router.route('/forum/getForumsByTag/:tag').get(searchForumByTag)
router.route('/forum/ban').post(protectPath, banUserFromForum).put(protectPath, unbanUserFromForum)
router.route('/forum/recommendForums').get(recommendForums)
router.route('/forum/leaveForum').post(protectPath, leaveForum)
router.route('/forum/subscribeToForum').post(protectPath, subscribeToForum)
router.route('/forum/:forumId').get(getForumById).put(protectPath, updateForum)

router.route('/thread').post(protectPath, createThread)
router.route('/thread/:threadId').get(getThreadById).put(protectPath, updateThread).delete(protectPath, deleteThreadConroller)
router.route('/thread/:threadId/likeDislike').post(protectPath, likeDislikeStateChanged)
router.route('/thread/:threadId/comments').get(getThreadsComments)
router.route('/thread/createComment').post(protectPath, createCommentToThread)
router.route('/thread/deleteComment/:commentId').delete(protectPath, deleteThreadComment)

router.route('/chat/:chatId/comments').get(protectPath, getChatsComments)
router.route('/chat/:chatId').get(protectPath, getChatDataById).delete(protectPath, deleteChat)
router.route('/chat/addFriend').post(protectPath, addFriendToChat)
router.route('/createOrRetrieveChat').post(protectPath, checkMutualChat)
router.route('/chat').post(protectPath, createChat)
router.route('/chat/leaveChat').post(protectPath, leaveChat)
router.route('/chats').get(protectPath, getUsersChats)

router.route('/comment').post(protectPath, createComment)
router.route('/comment/:commentId').patch(protectPath, updateComment).delete(protectPath, deleteComment)

router.route('/friends').get(protectPath, getFriends)
router.route('/friend/:friendName').post(protectPath, makeFriendRequest).delete(protectPath, deleteFriend)
router.route('/acceptFriendRequest/:requestCreatorName').post(protectPath, acceptFriendRequest)
router.route('/declineFriendRequest/:requestCreatorName').post(protectPath, declineFriendRequest)

router.route('/notification').get(protectPath, getUsersNotifications).post(protectPath, createNotification)
router.route('/notification/:notificationId').delete(protectPath, deleteNotification).put(protectPath, updateNotification)

module.exports = router
