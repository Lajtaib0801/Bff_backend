const forumAlreadyExistsError = require('./forumAlreadyExistsError')
const noForumFoundError = require('./noForumFoundError')
const notAuthorizedToBanUsersFromForumError = require('./notAuthorizedToBanUsersFromForumError')
const userIsAlreadyBannedFromForumError = require('./userIsAlreadyBannedFromForumError')
const noForumNameGivenError = require('./noForumNameGivenError')
const notAuthorizedToDeleteForumError = require('./notAuthorizedToDeleteForumError')
const youAreNotInThisForumError = require('./youAreNotInThisForumError')
const youAreAlreadySubscribedToThisForumError = require('./youAreAlreadySubscribedToThisForumError')
const youAreBannedFromThisForumError = require('./youAreBannedFromThisForumError')
const forumNameTooLongError = require('./forumNameTooLongError')
const forumNameIsTooShortError = require('./forumNameIsTooShortError')
const forumDescriptionIsTooLongError = require('./forumDescriptionIsTooLongError')
const youCannotEditThisFieldError = require('./youCannotEditThisFieldError')
const tagIsTooLongError = require('./tagIsTooLongError')

module.exports = {
    forumAlreadyExistsError,
    noForumFoundError,
    notAuthorizedToBanUsersFromForumError,
    userIsAlreadyBannedFromForumError,
    noForumNameGivenError,
    notAuthorizedToDeleteForumError,
    youAreNotInThisForumError,
    youAreAlreadySubscribedToThisForumError,
    youAreBannedFromThisForumError,
    forumNameTooLongError,
    forumNameIsTooShortError,
    forumDescriptionIsTooLongError,
    youCannotEditThisFieldError,
    tagIsTooLongError,
}
