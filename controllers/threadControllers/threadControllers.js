const createThreadController = require('./createThreadController')
const deleteThreadConroller = require('./deleteThreadController')
const likeDislikeStateChanged = require('./likeDislikeStateChangedController')
const getThreadById = require('./getThreadByIdController')
const updateThread = require('./updateThreadController')
const createCommentToThread = require('./createCommentToThreadController')
const getThreadsComments = require('./getThreadsCommentsController')
const deleteThreadComment = require('./deleteThreadCommentController')

module.exports = {
    createThread: createThreadController,
    deleteThreadConroller,
    likeDislikeStateChanged,
    getThreadById,
    updateThread,
    createCommentToThread,
    getThreadsComments,
    deleteThreadComment
}
