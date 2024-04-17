const userAlreadyExistsError = require('./userAlreadyExistsError')
const noUserFoundError = require('./noUserFoundError')
const userIsAlreadyLoggedInError = require('./userIsAlreadyLoggedInError')
const wrongLoginDataError = require('./wrongLoginDataError')
const noPermissionToUsePathError = require('./noPermissionToUsePathError')
const userDoesNotHaveChatsYetError = require('./userDoesNotHaveChatsYetError')
const youHaveNoFriendWithThisNameError = require('./youHaveNoFriendWithThisNameError')

module.exports = {
    userAlreadyExistsError,
    noUserFoundError,
    userIsAlreadyLoggedInError,
    wrongLoginDataError,
    noPermissionToUsePathError,
    userDoesNotHaveChatsYetError,
    youHaveNoFriendWithThisNameError,
}