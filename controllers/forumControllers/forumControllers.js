const banUserFromForum = require('./banUserFromForumController')
const unbanUserFromForum = require('./unbanUserFromForumController')
const createForum = require('./createForumController')
const deleteForum = require('./deleteForumController')
const getForumById = require('./getForumByIdController')
const searchForumByTag = require('./searchForumsByTagController')
const updateForum = require('./updateForumController')
const recommendForums = require('./recommendForumsController')
const getAllForums = require('./getAllForumsController')
const getAllThreadsByForumId = require('./getAllThreadsByForumIdController')
const leaveForum = require('./leaveForumController')
const subscribeToForum = require('./subscribeToForumController')

module.exports = {
    banUserFromForum,
    unbanUserFromForum,
    createForum,
    deleteForum,
    getForumById,
    searchForumByTag,
    updateForum,
    recommendForums,
    getAllForums,
    getAllThreadsByForumId,
    leaveForum,
    subscribeToForum,
}
