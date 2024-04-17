const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const User = require('../../models/userModel')
const { StatusCodes } = require('http-status-codes')
const getCreatorIdFromHeaders = require('../../middlewares/getCreatorIdFromHeaders')

const deleteFriend = tryCatchWrapper(async (req, res) => {
    const id = await getCreatorIdFromHeaders(req.headers)
    const deletersProfile = await User.findById(id)
    const friend = await User.findOne({ username: req.params.friendName })
    if (!friend || !deletersProfile.friends.includes(friend._id)) {
        res.status(StatusCodes.NOT_FOUND).json({ message: 'No friend found!' })
        return
    }
    deletersProfile.friends.pull(friend._id)
    await deletersProfile.save()
    friend.friends.pull(id)
    await friend.save()
    res.status(StatusCodes.OK).json({ message: 'Friend deleted' })
    return
})

module.exports = deleteFriend
