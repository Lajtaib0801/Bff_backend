const chai = require('chai')
const should = chai.should()
const expect = chai.expect
const chaiHttp = require('chai-http')
const server = require('../../index.js')
const User = require('../../models/userModel.js')
const Chatroom = require('../../models/chatroomModel.js')
const Comment = require('../../models/commentModel.js')
chai.use(chaiHttp)

describe("userController's tests", () => {
    let userToken
    let otherUserToken
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
        const otherLoginRes = await chai.request(server).post('/login').send({
            email: 'otherTestUser@otherTestUser.com',
            password: 'StrongTestPassword1234!',
        })
        otherUserToken = otherLoginRes.body.token
    })
    describe('/friends GET route test when there are no friends', () => {
        it('should return with 200 status code and an empty array', (done) => {
            chai.request(server)
                .get('/friends')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('object')
                    res.body.pagesCount.should.be.a('number').that.is.equal(0)
                    res.body.returnFriends.should.be.an('array').that.is.empty
                    done()
                })
        })
    })

    describe('/user/friends/requests GET route test when there are no friend requests', () => {
        it('should return with 200 status code and an empty array', (done) => {
            chai.request(server)
                .get('/user/friends/requests')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('object').that.has.property('returnRequests').that.is.an('array').and.is.empty
                    done()
                })
        })
    })

    describe('/user/friends/sentRequests GET route test when there are no sent friend requests', () => {
        it('should return with 200 status code and an empty array', (done) => {
            chai.request(server)
                .get('/user/friends/sentRequests')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('object').that.has.property('sentRequests').that.is.an('array').and.is.empty
                    done()
                })
        })
    })

    describe('/friend/:friendName POST but with declined friend request', () => {
        it('should return with 200 status code and success message', (done) => {
            chai.request(server)
                .post('/friend/otherTestUser')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.an('string')
                        .and.is.equal('Friend request sent')
                    done()
                })
        })
        it('should return with 200 status code and success message', (done) => {
            chai.request(server)
                .post('/declineFriendRequest/randomTestUser')
                .set({
                    authorization: 'Bearer ' + otherUserToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.an('string')
                        .and.is.equal('Friend request declined')
                    done()
                })
        })
        it("should return with 200 status code and an empty array from randomTestUser's side", (done) => {
            chai.request(server)
                .get('/friends')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.body.should.be.an('object')
                    res.body.pagesCount.should.be.a('number').that.is.equal(0)
                    res.body.returnFriends.should.be.an('array').that.is.empty
                    done()
                })
        })
        it("should return with 200 status code and an empty array from otherTestUser's side aswell", (done) => {
            chai.request(server)
                .get('/friends')
                .set({
                    authorization: 'Bearer ' + otherUserToken,
                })
                .end((err, res) => {
                    res.body.should.be.an('object')
                    res.body.pagesCount.should.be.a('number').that.is.equal(0)
                    res.body.returnFriends.should.be.an('array').that.is.empty
                    done()
                })
        })
    })
    describe('/friend/:friendName POST route test when there is no sent friend request to that specific user', () => {
        it('should return with 200 status code and success message', (done) => {
            chai.request(server)
                .post('/friend/otherTestUser')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.an('string')
                        .and.is.equal('Friend request sent')
                    done()
                })
        })
    })
    describe('/friend/:friendName POST route test when there is a sent friend request to that specific user', () => {
        it('should return 400 statuscode and error message', (done) => {
            chai.request(server)
                .post('/friend/otherTestUser')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.an('string')
                        .and.is.equal('You already sent a friend request to this user!')
                    done()
                })
        })
    })

    describe('/user/friends/sentRequests GET route test when there is a sent friend request', () => {
        it('should return with 200 status code and an array with one element', (done) => {
            chai.request(server)
                .get('/user/friends/sentRequests')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be
                        .an('object')
                        .that.has.property('sentRequests')
                        .that.is.an('array')
                        .and.has.lengthOf(1)
                    done()
                })
        })
    })
    describe('/acceptFriendRequest/:requestCreatorName POST route test with the other user', () => {
        it('should return with 200 status code and an array with one element', (done) => {
            chai.request(server)
                .get('/user/friends/requests')
                .set({
                    authorization: 'Bearer ' + otherUserToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be
                        .an('object')
                        .that.has.property('returnRequests')
                        .that.is.an('array')
                        .and.has.lengthOf(1)
                    done()
                })
        })
        it('should return with 200 status code and success message', (done) => {
            chai.request(server)
                .post('/acceptFriendRequest/randomTestUser')
                .set({
                    authorization: 'Bearer ' + otherUserToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.an('string')
                        .and.is.equal('Friend request accepted')
                    done()
                })
        })
        it('should return with 200 status code and an array with one element', (done) => {
            chai.request(server)
                .get('/friends')
                .set({
                    authorization: 'Bearer ' + otherUserToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('object')
                    res.body.pagesCount.should.be.a('number').that.is.equal(1)
                    res.body.returnFriends.should.be.an('array').that.has.lengthOf(1)
                    done()
                })
        })
    })
    describe('/friend/:friendName POST route test when the two users are already friends', () => {
        it('should return 400 statuscode and error message', (done) => {
            chai.request(server)
                .post('/friend/otherTestUser')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.an('string')
                        .and.is.equal('You are already friends with this user!')
                    done()
                })
        })
    })
    describe('route tests after the otherUser accepted the friend request', () => {
        it('should return with 200 status code and an array with one element', (done) => {
            chai.request(server)
                .get('/friends')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('object')
                    res.body.pagesCount.should.be.a('number').that.is.equal(1)
                    res.body.returnFriends.should.be.an('array').and.has.lengthOf(1)
                    done()
                })
        })
        it('should return with 200 status code and an empty array', (done) => {
            chai.request(server)
                .get('/user/friends/requests')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('object').that.has.property('returnRequests').that.is.an('array').and.is.empty
                    done()
                })
        })
        it('should return with 200 status code and an array with one element', (done) => {
            chai.request(server)
                .get('/user/friends/sentRequests')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be
                        .an('object')
                        .that.has.property('sentRequests')
                        .that.is.an('array')
                        .and.has.lengthOf(0)
                    done()
                })
        })
    })
    describe('/acceptFriendRequest/:requestCreatorName POST route test when there are no requests', () => {
        it('should return with 400 status code and an error message', (done) => {
            chai.request(server)
                .post('/acceptFriendRequest/randomTestUser')
                .set({
                    authorization: 'Bearer ' + otherUserToken,
                })
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.an('string')
                        .and.is.equal('You have no pending friend requests from this user!')
                    done()
                })
        })
        it('should return with 400 status code and an error message', (done) => {
            chai.request(server)
                .post('/acceptFriendRequest/randomTestUser')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.an('string')
                        .and.is.equal('You have no pending friend requests from this user!')
                    done()
                })
        })
    })
    describe('test every route without the authorization header', () => {
        describe('/friends GET route test when there are no friends', () => {
            it('should return with 401 status code and unauthorized error', (done) => {
                chai.request(server)
                    .get('/friends')
                    .set({
                        authorization: 'Bearer ',
                    })
                    .end((err, res) => {
                        res.should.have.status(401)
                        done()
                    })
            })
        })

        describe('/user/friends/requests GET route test when there are no friend requests', () => {
            it('should return with 401 status code and unauthorized error', (done) => {
                chai.request(server)
                    .get('/user/friends/requests')
                    .set({
                        authorization: 'Bearer ',
                    })
                    .end((err, res) => {
                        res.should.have.status(401)
                        done()
                    })
            })
        })
        describe('/user/friends/sentRequests GET route test when there are no sent friend requests', () => {
            it('should return with 401 status code and unauthorized error', (done) => {
                chai.request(server)
                    .get('/user/friends/sentRequests')
                    .set({
                        authorization: 'Bearer ',
                    })
                    .end((err, res) => {
                        res.should.have.status(401)
                        done()
                    })
            })
        })
        describe('/friend/:friendName POST route test when there is no sent friend request to that specific user', () => {
            it('should return with 401 status code and unauthorized error', (done) => {
                chai.request(server)
                    .post('/friend/otherTestUser')
                    .set({
                        authorization: 'Bearer ',
                    })
                    .end((err, res) => {
                        res.should.have.status(401)
                        done()
                    })
            })
        })
        describe('/friend/:friendName POST route test when there is a sent friend request to that specific user', () => {
            it('should return with 401 status code and unauthorized error', (done) => {
                chai.request(server)
                    .post('/friend/otherTestUser')
                    .set({
                        authorization: 'Bearer ',
                    })
                    .end((err, res) => {
                        res.should.have.status(401)
                        done()
                    })
            })
        })
        describe('/user/friends/sentRequests GET route test when there is a sent friend request', () => {
            it('should return with 401 status code and unauthorized error', (done) => {
                chai.request(server)
                    .get('/user/friends/sentRequests')
                    .set({
                        authorization: 'Bearer ',
                    })
                    .end((err, res) => {
                        res.should.have.status(401)
                        done()
                    })
            })
        })
        describe('/acceptFriendRequest/:requestCreatorName POST route test when there no token in the header', () => {
            it('should return with 401 status code and unauthorized error', (done) => {
                chai.request(server)
                    .post('/acceptFriendRequest/randomTestUser')
                    .set({
                        authorization: 'Bearer ',
                    })
                    .end((err, res) => {
                        res.should.have.status(401)
                        done()
                    })
            })
        })
        describe('/declineFriendRequest/:requestCreatorName POST route test when there no token in the header', () => {
            it('should return with 401 status code and unauthorized error', (done) => {
                chai.request(server)
                    .post('/declineFriendRequest/randomTestUser')
                    .set({
                        authorization: 'Bearer ',
                    })
                    .end((err, res) => {
                        res.should.have.status(401)
                        done()
                    })
            })
        })
    })
})
