const createNotification = require('./createNotificationController')
const getUsersNotifications = require('./getUsersNotificationsController')
const deleteNotification = require('./deleteNotificationController')
const updateNotification = require('./updateNotificationController')

module.exports = {
    createNotification,
    getUsersNotifications,
    deleteNotification,
    updateNotification,
}