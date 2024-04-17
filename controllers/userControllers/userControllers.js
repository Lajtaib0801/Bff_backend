const loginController = require('./loginController')
const registerController = require('./registerController')
const userController = require('./userController')
const getUsersChatsController = require('./getUsersChatsController')
const changePassword = require('./changePassword')
const confirmPasswordChange = require('./confirmPasswordChange')

module.exports = {
    loginUser: loginController,
    registerUser: registerController,
    userController: userController,
    getUsersChats: getUsersChatsController,
    changePassword: changePassword,
    confirmPasswordChange: confirmPasswordChange,
}