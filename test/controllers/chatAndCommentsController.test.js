const chai = require('chai')
const should = chai.should()
const expect = chai.expect
const chaiHttp = require('chai-http')
const server = require('../../index.js')
const User = require('../../models/userModel.js')
const Chatroom = require('../../models/chatroomModel.js')
const Comment = require('../../models/commentModel.js')
chai.use(chaiHttp)

describe("chatController's tests", () => {
    let userToken
    let chatId
    let commentId
    let ids = []
    let emailTokens = []
    before(async () => {
        await User.deleteMany({})
        await Chatroom.deleteMany({})
        await Comment.deleteMany({})
        await chai.request('http://localhost:8090/api/messages/*').delete('/')
        await chai.request(server).post('/register').send({
            username: 'randomTestUser',
            email: 'randomTestUser@randomTestUser.com',
            password: 'StrongTestPassword1234!',
        })
        await chai.request(server).post('/register').send({
            username: 'otherTestUser',
            email: 'otherTestUser@otherTestUser.com',
            password: 'StrongTestPassword1234!',
        })
        await chai
            .request('http://localhost:8090/api/messages')
            .get('/')
            .then(async (res) => {
                for (const email of res.body) {
                    ids.push(email.id)
                }
                for (const id of ids) {
                    const res = await chai.request('http://localhost:8090/api/messages/' + id + '/raw').get('/')
                    emailTokens.push(res.text.split('verifyEmail/')[1].split('"')[0].replace(/=\r\n/g, ''))
                }
                for await (const emailToken of emailTokens) {
                    await chai.request(server).get('/verifyEmail/' + emailToken)
                }
            })
        const loginRes = await chai.request(server).post('/login').send({
            email: 'randomTestUser@randomTestUser.com',
            password: 'StrongTestPassword1234!',
        })
        userToken = loginRes.body.token
    })

    describe('/chats GET route test', () => {
        it('should return with 200 status code and an empty array', (done) => {
            chai.request(server)
                .get('/chats')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.have.property('returnArray').that.is.an('array').and.is.empty
                    done()
                })
        })
    })

    describe('/chat POST route test', () => {
        it("should return with 201 status code and the chat's id", (done) => {
            chai.request(server)
                .post('/chat')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    name: 'randomTestChat',
                    is_ttl: false,
                    is_private: true,
                    usernames: ['otherTestUser'],
                })
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.have.property('roomId')
                    chatId = res.body.roomId
                    done()
                })
        })
    })
    describe('/chats route test', () => {
        it('should return with 200 status code and an array with one element now', (done) => {
            chai.request(server)
                .get('/chats')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.have.property('returnArray').that.is.an('array').and.have.lengthOf(1)
                    done()
                })
        })
    })
    describe('/chat/:chatId GET route test', () => {
        it("should return with 200 status code and an object with the chat's info", (done) => {
            chai.request(server)
                .get(`/chat/${chatId}`)
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.have.property('chat')
                    res.body.chat.should.have
                        .property('time_to_live')
                        .that.is.a('object')
                        .that.have.property('is_ttl')
                        .that.is.equal(false)
                    res.body.chat.should.have.property('is_private').that.is.equal(true)
                    res.body.chat.should.have.property('name').that.is.equal('randomTestChat')
                    res.body.chat.should.have.property('users').that.is.an('array').that.have.lengthOf(1)
                    res.body.chat.should.have.property('owner').that.is.a('string').lengthOf(24)
                    res.body.chat.should.have.property('common_topics').that.is.an('array').and.is.empty
                    done()
                })
        })
    })
    describe('/chat/:chatId/comments GET route test', () => {
        it('should return with 200 status code and an empty array', (done) => {
            chai.request(server)
                .get(`/chat/${chatId}/comments`)
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.have.property('comments').that.is.an('array').and.is.empty
                    done()
                })
        })
    })
    describe('/comments POST route test', () => {
        it('should return with 201 status code and a success boolean field', (done) => {
            chai.request(server)
                .post('/comment')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    room_id: chatId,
                    text: 'randomTestComment1234',
                    is_reply: false,
                })
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.have.property('success').that.is.a('boolean').that.is.equal(true)
                    done()
                })
        })
    })
    describe('/chat/:chatId/comments route test', () => {
        it('should return with 200 status code and an array with one comment object element', (done) => {
            chai.request(server)
                .get(`/chat/${chatId}/comments`)
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.have.property('comments').that.is.an('array').and.have.lengthOf(1)
                    res.body.comments[0].should.have
                        .property('text')
                        .that.is.a('string')
                        .that.is.equal('randomTestComment1234')
                    res.body.comments[0].should.have.property('likes').that.is.a('number').that.is.equal(0)
                    res.body.comments[0].should.have.property('dislikes').that.is.a('number').that.is.equal(0)
                    res.body.comments[0].should.have
                        .property('creator_name')
                        .that.is.a('string')
                        .that.is.equal('randomTestUser')
                    res.body.comments[0].should.have
                        .property('_id')
                        .that.is.an('object')
                        .that.have.property('room_id')
                        .that.is.a('string')
                        .lengthOf(24)
                    res.body.comments[0].should.have
                        .property('_id')
                        .that.is.an('object')
                        .that.have.property('message_id')
                        .that.is.a('string')
                        .lengthOf(24)
                    res.body.comments[0].should.have
                        .property('reply')
                        .that.is.an('object')
                        .that.have.property('is_reply')
                        .that.is.a('boolean')
                        .that.is.equal(false)
                    res.body.comments[0].should.have
                        .property('reply')
                        .that.is.an('object')
                        .that.have.property('parent_comment_id')
                        .that.is.equal(null)
                    res.body.comments[0].should.have
                        .property('reply')
                        .that.is.an('object')
                        .that.have.property('sequential_number')
                        .that.is.an('number')
                        .and.is.equal(0)
                    commentId = res.body.comments[0]._id.message_id
                    done()
                })
        })
    })
    describe('/comment/:commentId PATCH route test', () => {
        it('should return with 400 status code and an error message', (done) => {
            chai.request(server)
                .patch('/comment/' + commentId)
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    text: 'randfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffomTestCommentwertwertwertw12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345randomTestComment12345',
                })
                .end((err, res) => {
                    res.should.have.status(413)
                    res.body.should.have
                        .property('message')
                        .that.is.a('string')
                        .that.is.equal(
                            'Too many characters in the comment (2090).The max comment length is 2000 characters!'
                        )
                    done()
                })
        })
    })
    describe('/comment/:commentId PATCH route test', () => {
        it('should return with 200 status code and an object with the updated comment', (done) => {
            chai.request(server)
                .patch('/comment/' + commentId)
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    text: 'UpdatedCommentText',
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.have
                        .property('message')
                        .that.is.a('string')
                        .that.is.equal('Comment updated successfully')
                    done()
                })
        })
    })
    describe('/comment/:commentId DELETE route test', () => {
        it('should return with 200 status code and a message', (done) => {
            chai.request(server)
                .delete('/comment/' + commentId)
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.have
                        .property('message')
                        .that.is.a('string')
                        .that.is.equal('Comment deleted successfully')
                    done()
                })
        })
    })
    describe('/comment/:commentId DELETE route test', () => {
        it('should return with 404 status code and a not found error message', (done) => {
            chai.request(server)
                .delete('/comment/' + commentId)
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.should.have.property('message').that.is.a('string').that.is.equal('Comment not found')
                    done()
                })
        })
    })
    describe('/comment/:commentId PATCH route test', () => {
        it('should return with 404 status code and not found error', (done) => {
            chai.request(server)
                .patch('/comment/' + commentId)
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    text: 'UpdatedCommentText',
                })
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.should.have.property('message').that.is.a('string').that.is.equal('Comment not found')
                    done()
                })
        })
    })
    describe('/chat/:chatId', () => {
        it('should return with 200 status code and with a message', (done) => {
            chai.request(server)
                .delete('/chat/' + chatId)
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.have
                        .property('message')
                        .that.is.a('string')
                        .that.is.equal('Chat deleted successfully.')
                    done()
                })
        })
    })
    describe('/chat/:chatId', () => {
        it('should return with 404 status code and an with an error message', (done) => {
            chai.request(server)
                .delete('/chat/' + chatId)
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(404)                 
                    res.body.should.have.property('message').that.is.a('string').that.is.equal('No chat found with id: undefined')
                    done()
                })
        })
    })
    describe('/chat POST route test', () => {
        it("should create another chat return with 201 status code and the chat's id", (done) => {
            chai.request(server)
                .post('/chat')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    name: 'anotherRandomTestChat',
                    is_ttl: false,
                    is_private: true,
                    usernames: ['otherTestUser'],
                })
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.have.property('roomId')
                    chatId = res.body.roomId
                    done()
                })
        })
    })
    describe('/chat/leaveChat POST route test', () => {
        it('should return with 200 status code and a message', (done) => {
            chai.request(server)
                .post('/chat/leaveChat')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    chat_id: chatId,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.have
                        .property('message')
                        .that.is.a('string')
                        .that.is.equal('Chat left successfully!')
                    done()
                })
        })
    })
    describe('/chat/leaveChat POST route test', () => {
        it('should return with 400 status code and an error message', (done) => {
            chai.request(server)
                .post('/chat/leaveChat')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    chat_id: chatId,
                })
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.have
                        .property('message')
                        .that.is.a('string')
                        .that.is.equal('You are not in this chat!')
                    done()
                })
        })
    })
    describe('/chat/:chatId route test', () => {
        it("should return with 200 status code and an object with the chat's info, but now the users array should be empty", (done) => {
            chai.request(server)
                .get(`/chat/${chatId}`)
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.have.property('chat')
                    res.body.chat.should.have
                        .property('time_to_live')
                        .that.is.a('object')
                        .that.have.property('is_ttl')
                        .that.is.equal(false)
                    res.body.chat.should.have.property('is_private').that.is.equal(true)
                    res.body.chat.should.have.property('name').that.is.equal('anotherRandomTestChat')
                    res.body.chat.should.have.property('users').that.is.an('array').that.have.lengthOf(0)
                    res.body.chat.should.have.property('owner').that.is.a('string').lengthOf(24)
                    res.body.chat.should.have.property('common_topics').that.is.an('array').and.is.empty
                    done()
                })
        })
    })
    describe('/chat/leaveChat POST route test', () => {
        it('should delete the chat and return status code 200', async () => {
            userToken = (
                await chai.request(server).post('/login').send({
                    email: 'otherTestUser@otherTestUser.com',
                    password: 'StrongTestPassword1234!',
                })
            ).body.token
            const res = await chai
                .request(server)
                .post('/chat/leaveChat')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    chat_id: chatId,
                })
            res.should.have.status(200)
            res.body.should.have.property('message').that.is.a('string').that.is.equal('Chat left successfully!')
        })
    })
    describe('/chats route test', () => {
        it('should return with 200 status code and an empty array', (done) => {
            chai.request(server)
                .get('/chats')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.have.property('returnArray').that.is.an('array').and.is.empty
                    done()
                })
        })
    })
    describe('/chat POST route test', () => {
        it("should create another chat return with 201 status code and the chat's id", (done) => {
            chai.request(server)
                .post('/chat')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    name: 'anotherRandomTestChat',
                    is_ttl: false,
                    is_private: true,
                    usernames: ['otherTestUser'],
                })
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.have.property('roomId')
                    chatId = res.body.roomId
                    done()
                })
        })
    })
    describe('/chat/addFriend POST route test', () => {
        it('should return with 404 status code and you have no friend with name error', (done) => {
            chai.request(server)
                .post('/chat/addFriend')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    friend_name: 'otherTestUser',
                    chat_id: chatId,
                })
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.should.have
                        .property('message')
                        .that.is.a('string')
                        .that.is.equal('You have no friend with name: otherTestUser')
                    done()
                })
        })
    })

    describe('test the /chats GET route when there is no token in the headers', () => {
        it('should return with 401 status code and an error message', (done) => {
            chai.request(server)
                .get('/chats')
                .set({
                    authorization: 'Bearer ',
                })
                .end((err, res) => {
                    res.should.have.status(401)
                    res.body.should.have
                        .property('message')
                        .that.is.a('string')
                        .that.is.equal('You have no permission to use path: /chats')
                    done()
                })
        })
    })
    describe('/chat POST route test when there is no token in the headers', () => {
        it('should return with 401 status code and an error message', (done) => {
            chai.request(server)
                .post('/chat')
                .set({
                    authorization: 'Bearer ',
                })
                .send({
                    name: 'randomTestChat',
                    is_ttl: false,
                    is_private: true,
                    usernames: ['otherTestUser'],
                })
                .end((err, res) => {
                    res.should.have.status(401)
                    res.body.should.have
                        .property('message')
                        .that.is.a('string')
                        .that.is.equal('You have no permission to use path: /chat')
                    done()
                })
        })
    })
    describe('/chat/:chatId GET route test when there is no token in the headers', () => {
        it('should return with 401 status code and an error message', (done) => {
            chai.request(server)
                .get(`/chat/${chatId}`)
                .set({
                    authorization: 'Bearer ',
                })
                .end((err, res) => {
                    res.should.have.status(401)
                    res.body.should.have
                        .property('message')
                        .that.is.a('string')
                        .that.is.equal(`You have no permission to use path: /chat/${chatId}`)
                    done()
                })
        })
    })
    describe('/chat/:chatId/comments GET route test when there is no token in the headers', () => {
        it('should return with 401 status code and an error message', (done) => {
            chai.request(server)
                .get(`/chat/${chatId}/comments`)
                .set({
                    authorization: 'Bearer ',
                })
                .end((err, res) => {
                    res.should.have.status(401)
                    res.body.should.have
                        .property('message')
                        .that.is.a('string')
                        .that.is.equal(`You have no permission to use path: /chat/${chatId}/comments`)
                    done()
                })
        })
    })
    describe('/comments POST route test when there is no token in the headers', () => {
        it('should return with 401 status code and an error message', (done) => {
            chai.request(server)
                .post('/comment')
                .set({
                    authorization: 'Bearer ',
                })
                .send({
                    room_id: chatId,
                    text: 'randomTestComment1234',
                    is_reply: false,
                })
                .end((err, res) => {
                    res.should.have.status(401)
                    res.body.should.have
                        .property('message')
                        .that.is.a('string')
                        .that.is.equal('You have no permission to use path: /comment')
                    done()
                })
        })
    })
    describe('/comment/:commentId PATCH route test when there is no token in the headers', () => {
        it('should return with 401 status code and an error message', (done) => {
            chai.request(server)
                .patch('/comment/' + commentId)
                .set({
                    authorization: 'Bearer ',
                })
                .send({
                    text: 'randomTestComment1234',
                })
                .end((err, res) => {
                    res.should.have.status(401)
                    res.body.should.have
                        .property('message')
                        .that.is.a('string')
                        .that.is.equal(`You have no permission to use path: /comment/${commentId}`)
                    done()
                })
        })
    })
    describe('/chat/leaveChat POST route test when there is no token in the headers', () => {
        it('should delete the chat and return status code 200', (done) => {
            chai.request(server)
                .post('/chat/leaveChat')
                .set({
                    authorization: 'Bearer ',
                })
                .send({
                    chat_id: chatId,
                })
                .end((err, res) => {
                    res.should.have.status(401)
                    res.body.should.have
                        .property('message')
                        .that.is.a('string')
                        .that.is.equal('You have no permission to use path: /chat/leaveChat')
                    done()
                })
        })
    })
    describe('/chat/addFriend POST route test when there is no token in the headers', () => {
        it('should return with 404 status code and you have no friend with name error', (done) => {
            chai.request(server)
                .post('/chat/addFriend')
                .set({
                    authorization: 'Bearer ',
                })
                .send({
                    friend_name: 'otherTestUser',
                    chat_id: chatId,
                })
                .end((err, res) => {
                    res.should.have.status(401)
                    res.body.should.have
                        .property('message')
                        .that.is.a('string')
                        .that.is.equal('You have no permission to use path: /chat/addFriend')
                    done()
                })
        })
    })
})
