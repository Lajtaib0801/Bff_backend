require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const http = require('http')
const socketIo = require('socket.io')
const connectDB = require('./db/connect')
const Comment = require('./models/commentModel')
const router = require('./routes/router')
const errorHandlerMiddleware = require('./middlewares/errorHandler')
const noMiddlewareFound = require('./middlewares/noMiddlewareFoundError')
const User = require('./models/userModel')
const Thread = require('./models/threadModel')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const swaggerUi = require('swagger-ui-express')
const swaggerOutput = require('./swagger_output.json')
const { ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')
const { Realtime } = require('ably')
const Forum = require('./models/forumModel')
const getForumById = require('./controllers/forumControllers/getForumByIdController')
const { getUserProfileByUsername } = require('./controllers/userControllers/userController')

const app = express()
app.set('trust proxy', 1)
const server = http.createServer(app)
const io = socketIo(server, {
    cors: { origin: process.env.FRONTEND_URL, credentials: true },
})

app.use(cookieParser())
app.use(express.json())
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(express.urlencoded({ extended: true }))
app.use(mongoSanitize())
app.use(xss())
app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
)
const limiter = rateLimit({
    windowMs: 1000,
    max: 100,
})
app.use(limiter)
app.use(hpp())
app.use(morgan('dev'))
app.use('/', router)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput))
app.use(noMiddlewareFound)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 3000
const startServer = async () => {
    try {
        await connectDB(process.env.DB)
        console.log('MongoDB connected')
        const commentChangeStream = Comment.watch()
        const forumChangeStream = Forum.watch()
        if (process.env.NODE_ENV === 'development') {
            const connectedClients = {}
            io.on('connect', (socket) => {
                console.log('Socket IO connected')
                if (socket.handshake.query.username !== 'null' && socket.handshake.query.username !== undefined) {
                    console.log(JSON.parse(socket.handshake.query.username).username)
                    connectedClients[JSON.parse(socket.handshake.query.username).username] = socket
                    socket.on('disconnect', () => {
                        console.log('User disconnected')
                        delete connectedClients[JSON.parse(socket.handshake.query.username).username]
                    })
                }
            })
            commentChangeStream.on('change', async (change) => {
                if (await Thread.findOne({ '_id.thread_id': change.documentKey._id.room_id })) {
                    return
                }
                io.emit('commentChange', change)
                io.emit('message', await createEmitResponse(change))
            })
            forumChangeStream.on('change', async (change) => {
                if (change.operationType === 'update') {
                    // TODO: Benji help
                    console.log('Forum updated')
                    console.log("ably doesn't work")
                    const updatedData = change.updateDescription.updatedFields
                    console.log(updatedData.users)
                    if (updatedData.users) {
                        return
                    }
                    const users = await getForumsUsersById(change.documentKey._id.forum_id.toString())
                    const creatorId = change.documentKey._id.creator_id
                    const creatorName = (await User.findById(creatorId.toString()))?.username
                    const forumId = change.documentKey._id
                    const forumName = (await Forum.findById(forumId)).forum_name

                    let updateMessage = `A forum you have subscribed to (${forumName}) has changed their data!`

                    updatedData.forum_name !== undefined &&
                        (updateMessage += ` Their new name is: ${updatedData.forum_name}`)
                    const otherUpdatedFields = Object.keys(updatedData).filter((key) => key !== 'forum_name')
                    if (otherUpdatedFields.length > 0) {
                        updateMessage += ' Updated fields are:'
                        updateMessage += ` ${otherUpdatedFields.join(', ')}`
                    }
                    for (const username of users) {
                        if (connectedClients[username] !== undefined) {
                            connectedClients[username].emit('forumUpdate', { updateMessage })
                        }
                        sendNotification(username, updateMessage)
                    }
                    if (connectedClients[creatorName] !== undefined) {
                        connectedClients[creatorName].emit('forumUpdate', { updateMessage })
                        sendNotification(creatorName, updateMessage)
                    }
                }
            })
        } else {
            const connectedClients = {}
            const ably = new Realtime(process.env.ABLY_API_KEY)
            console.log('Ably connected')
            const connect = ably.channels.get('connect')
            connect.subscribe('connect', async (message) => {
                console.log(`${JSON.parse(message.data.username).username} connected`)
                console.log(message.connectionId)
                connectedClients[JSON.parse(message.data.username).username] = message.connectionId
            })
            connect.subscribe('disconnect', async (message) => {
                console.log(`${message.data.username} disconnected${message.data.username}`)
                delete connectedClients[message.data.username]
            })
            commentChangeStream.on('change', async (change) => {
                const channel = ably.channels.get('commentChanges')
                channel.publish('commentChanges', await createEmitResponse(change))
            })
            forumChangeStream.on('change', async (change) => {
                if (change.operationType === 'update') {
                    console.log('Forum updated')
                    console.log('ably works')
                    const updatedData = change.updateDescription.updatedFields
                    console.log(updatedData.users)
                    if (updatedData.users) {
                        return
                    }
                    const users = await getForumsUsersById(change.documentKey._id.forum_id)
                    const creatorId = change.documentKey._id.creator_id
                    const creatorName = (await User.findById(creatorId)).username
                    const forumId = change.documentKey._id
                    const forumName = (await Forum.findById(forumId)).forum_name
                    let updateMessage = `A forum you have subscribed to (${forumName}) has changed their data!`
                    updatedData.forum_name !== undefined &&
                        (updateMessage += ` Their new name is: ${updatedData.forum_name}`)
                    const otherUpdatedFields = Object.keys(updatedData).filter((key) => key !== 'forum_name')
                    if (otherUpdatedFields.length > 0) {
                        updateMessage += ' Updated fields are:'
                        updateMessage += ` ${otherUpdatedFields.join(', ')}`
                    }
                    for (const username of users) {
                        if (connectedClients[username] !== undefined) {
                            const userChannel = ably.channels.get(`${username}forumUpdate`)
                            userChannel.publish(`${username}forumUpdate`, { updateMessage })
                            console.log(`${username}forumUpdate`)
                        }
                        sendNotification(username, updateMessage)
                    }
                    if (connectedClients[creatorName] !== undefined) {
                        const userChannel = ably.channels.get(`${creatorName}forumUpdate`)
                        userChannel.publish(`${creatorName}forumUpdate`, { updateMessage })
                        console.log(`${creatorName}forumUpdate`)
                    }
                    sendNotification(creatorName, updateMessage)
                }
            })
        }
        server.listen(port, () => console.log(`Server is listening on port: ${port}...`))
    } catch (error) {
        console.error('MongoDB connection error:', error)
        process.exit(1)
    }
}

startServer()
const createEmitResponse = async (change) => {
    return {
        _id: { message_id: change.fullDocument._id.message_id, room_id: change.fullDocument._id.room_id },
        text: change.fullDocument.text,
        reply: change.fullDocument.reply,
        likes: change.fullDocument.likes,
        diskiles: change.fullDocument.diskiles,
        emoticons: change.fullDocument.emotions,
        creation_date: change.fullDocument.creation_date,
        creator_name: (await User.findById(change.fullDocument._id.creator_id).select('username -_id')).username,
    }
}

const getForumsUsersById = async (forum_id) => {
    try {
        const forum = await Forum.findOne({ '_id.forum_id': forum_id })
        if (!forum) return []
        const userids = forum.users.map((user) => user.user_id)
        const usernames = []
        for (const userid of userids) {
            const user = await User.findById(userid)
            usernames.push(user.username)
        }
        return usernames
    } catch (error) {
        console.log(error)
    }
}
const sendNotification = async (username, updateMessage) => {
    const userId = await User.findOne({ username: username }).select('_id')
    let user = await User.findById(userId)
    if (!user) {
        throw new noUserFoundError()
    }
    if (!updateMessage || updateMessage.length == 0) {
        throw new notificationTextRequiredError()
    }
    user.notifications.push({ text: updateMessage })
    await user.save()
    return
}
module.exports = app
