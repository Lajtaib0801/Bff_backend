const chai = require('chai')
const should = chai.should()
const expect = chai.expect
const chaiHttp = require('chai-http')
const server = require('../../index.js')
chai.use(chaiHttp)
const User = require('../../models/userModel.js')
const Forum = require('../../models/forumModel.js')

describe('forumController tests', () => {
    let userToken
    let otherUserToken
    let forumId
    let threadId
    let ids = []
    let emailTokens = []
    before(async () => {
        await User.deleteMany({})
        await Forum.deleteMany({})
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
    describe('/forum GET route tests while the DB is empty', () => {
        it('should return with 200 status code and an empty array', (done) => {
            chai.request(server)
                .get('/forum')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('object')
                    res.body.pagesCount.should.be.a('number').that.equals(0)
                    res.body.forums.should.be.an('array').that.has.lengthOf(0)
                    done()
                })
        })
    })
    describe('/forum POST route tests', () => {
        it('should return with 400 status code and an error message', (done) => {
            chai.request(server)
                .post('/forum')
                .set({ authorization: 'Bearer ' + userToken })
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.is.equal('Please provide a forum name')
                    done()
                })
        })
        it('should return with 201 status code and success true', (done) => {
            chai.request(server)
                .post('/forum')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ forum_name: 'testForum' })
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.be.an('object').that.has.property('success').that.is.a('boolean').that.equals(true)
                    done()
                })
        })
    })
    describe('/forum GET route tests while the DB is not empty', () => {
        it('should return with 200 status code and an empty array', (done) => {
            chai.request(server)
                .get('/forum')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('object')
                    res.body.forums[0].should.be
                        .an('object')
                        .that.has.property('forum_name')
                        .that.is.a('string')
                        .that.equals('testForum')
                    res.body.forums[0].should.be.an('object').that.has.property('blacklist').that.is.a('array').that.is
                        .empty
                    res.body.forums[0].should.be.an('object').that.has.property('users').that.is.a('array').that.is
                        .empty
                    res.body.forums[0].should.be.an('object').that.has.property('tags').that.is.a('array').that.is.empty
                    res.body.forums[0].should.be
                        .an('object')
                        .that.has.property('rating')
                        .that.is.a('number')
                        .that.is.equal(0)
                    res.body.forums[0].should.be
                        .an('object')
                        .that.has.property('_id')
                        .that.is.a('object')
                        .that.has.property('creator_id')
                    res.body.forums[0].should.be
                        .an('object')
                        .that.has.property('_id')
                        .that.is.a('object')
                        .that.has.property('forum_id')
                    forumId = res.body.forums[0]._id.forum_id
                    done()
                })
        })
    })
    describe('/forum/:forumId GET route tests', () => {
        it('should return with 200 status code and an array with the forum', (done) => {
            chai.request(server)
                .get('/forum/' + forumId)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('array').lengthOf(1)
                    done()
                })
        })
    })
    describe('/forum/subscribeToForum tests', () => {
        it('should return with 404 status code and an error message', (done) => {
            chai.request(server)
                .post('/forum/subscribeToForum')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ forum_id: '507f1f77bcf86cd799439011' })
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.is.equal('No forum found')
                    done()
                })
        })
        it('should return with 401 status code and an error message', (done) => {
            chai.request(server)
                .post('/forum/subscribeToForum')
                .send({ forum_id: '507f1f77bcf86cd799439011' })
                .end((err, res) => {
                    res.should.have.status(401)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.is.equal('You have no permission to use path: /forum/subscribeToForum')
                    done()
                })
        })
        it('should return with 400 status code and an error message with the creator user', (done) => {
            chai.request(server)
                .post('/forum/subscribeToForum')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ forum_id: forumId })
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.is.equal('You are already subscribed to this forum!')
                    done()
                })
        })
        it('should return with 200 status code and success message', (done) => {
            chai.request(server)
                .post('/forum/subscribeToForum')
                .set({ authorization: 'Bearer ' + otherUserToken })
                .send({ forum_id: forumId })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.is.equal('Subscribed to forum successfully!')
                    done()
                })
        })
        it('should return with 400 status code and an error message but with the other user', (done) => {
            chai.request(server)
                .post('/forum/subscribeToForum')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ forum_id: forumId })
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.is.equal('You are already subscribed to this forum!')
                    done()
                })
        })
    })
    describe('/forum/leaveForum tests', () => {
        it('should return with 404 status code and an error message', (done) => {
            chai.request(server)
                .post('/forum/leaveForum')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ forum_id: '507f1f77bcf86cd799439011' })
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.is.equal('No forum found')
                    done()
                })
        })
        it('should return with 401 status code and an error message', (done) => {
            chai.request(server)
                .post('/forum/leaveForum')
                .send({ forum_id: '507f1f77bcf86cd799439011' })
                .end((err, res) => {
                    res.should.have.status(401)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.is.equal('You have no permission to use path: /forum/leaveForum')
                    done()
                })
        })
        it('should return with 200 status code and success message', (done) => {
            chai.request(server)
                .post('/forum/leaveForum')
                .set({ authorization: 'Bearer ' + otherUserToken })
                .send({ forum_id: forumId })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.is.equal('Forum left successfully!')
                    done()
                })
        })
        it('should return with 400 status code and an error message', (done) => {
            chai.request(server)
                .post('/forum/leaveForum')
                .set({ authorization: 'Bearer ' + otherUserToken })
                .send({ forum_id: forumId })
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.is.equal('You are not in this forum!')
                    done()
                })
        })
    })
    describe('/forum/getAllThreads/:forumId GET route tests while the forum has no threads', () => {
        it('should return with 200 status code and an empty array', (done) => {
            chai.request(server)
                .get('/forum/getAllThreads/' + forumId)
                .set({ authorization: 'Bearer ' + userToken })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('array').and.is.empty
                    done()
                })
        })
    })
    describe('/thread POST route tests', () => {
        it('should return with 201 status code', (done) => {
            chai.request(server)
                .post('/thread')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ forum_name: 'testForum', name: 'testThread', images: [], content: 'Some random text' })
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.be.an('object').that.has.property('success').that.is.a('boolean').that.equals(true)
                    done()
                })
        })
    })
    describe('/forum/getAllThreads/:forumId GET route tests while the forum has threads', () => {
        it('should return with 200 status code and an empty array', (done) => {
            chai.request(server)
                .get('/forum/getAllThreads/' + forumId)
                .set({ authorization: 'Bearer ' + userToken })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('array').has.lengthOf(1)
                    threadId = res.body[0]._id.thread_id
                    done()
                })
        })
    })
    describe('/thread/:threadId/likeDislike POST route tests', () => {
        it('should like the thread, then return with 200 status code and message that everything is ok', (done) => {
            chai.request(server)
                .post('/thread/' + threadId + '/likeDislike')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ pressedButton: 'like' })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.equals('Thread liked')
                    done()
                })
        })
        it('should unlike the thread, then return with 200 status code and message that everything is ok', (done) => {
            chai.request(server)
                .post('/thread/' + threadId + '/likeDislike')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ pressedButton: 'like' })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.equals('Thread unliked')
                    done()
                })
        })
        it('should like the thread, then return with 200 status code and message that everything is ok', (done) => {
            chai.request(server)
                .post('/thread/' + threadId + '/likeDislike')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ pressedButton: 'like' })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.equals('Thread liked')
                    done()
                })
        })
        it('should dislike the thread, then return with 200 status code and message that everything is ok', (done) => {
            chai.request(server)
                .post('/thread/' + threadId + '/likeDislike')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ pressedButton: 'dislike' })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.equals('Thread disliked')
                    done()
                })
        })
        it('should undislike the thread, then return with 200 status code and message that everything is ok', (done) => {
            chai.request(server)
                .post('/thread/' + threadId + '/likeDislike')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ pressedButton: 'dislike' })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.equals('Thread undisliked')
                    done()
                })
        })
        it('should dislike the thread, then return with 200 status code and message that everything is ok', (done) => {
            chai.request(server)
                .post('/thread/' + threadId + '/likeDislike')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ pressedButton: 'dislike' })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.equals('Thread disliked')
                    done()
                })
        })
        it('should return 401 status code and error message', (done) => {
            chai.request(server)
                .post('/thread/' + threadId + '/likeDislike')
                .set({ authorization: 'Bearer ' })
                .send({ pressedButton: 'dislike' })
                .end((err, res) => {
                    res.should.have.status(401)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.equals('You have no permission to use path: /thread/' + threadId + '/likeDislike')
                    done()
                })
        })
    })
    describe('/forum/:forumId PUT update forum test', () => {
        it('should return with 200 status code and success true', (done) => {
            chai.request(server)
                .put('/forum/' + forumId)
                .set({ authorization: 'Bearer ' + userToken })
                .send({ forum_name: 'testForumUpdated', tags: ['testTag'] })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.equals('Forum updated')
                    done()
                })
        })
    })
    describe('/forum/:forumId GET route tests', () => {
        it('should return with 200 status code and with the forum', (done) => {
            chai.request(server)
                .get('/forum/' + forumId)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('array').lengthOf(1)
                    res.body[0].should.have.property('forum_name').that.is.a('string').that.equals('testForumUpdated')
                    done()
                })
        })
    })
    describe('/forum/getForumsByTag/:tag GET route tests while the forum has threads', () => {
        it('should return with 200 status code and an array with the forum', (done) => {
            chai.request(server)
                .get('/forum/getForumsByTag/testTag')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('array').lengthOf(1)
                    done()
                })
        })
        it('should return with 200 status code and an empty array', (done) => {
            chai.request(server)
                .get('/forum/getForumsByTag/testTagg')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('array').lengthOf(0)
                    done()
                })
        })
    })
    describe('/forum/recommendForums route test', () => {
        it('should return with 201 status code and success true', (done) => {
            chai.request(server)
                .post('/forum')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ forum_name: 'testForum2' })
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.be.an('object').that.has.property('success').that.is.a('boolean').that.equals(true)
                    done()
                })
        })
        it('should return with 201 status code and success true', (done) => {
            chai.request(server)
                .post('/forum')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ forum_name: 'testForum3' })
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.be.an('object').that.has.property('success').that.is.a('boolean').that.equals(true)
                    done()
                })
        })
        it('should return with 201 status code and success true', (done) => {
            chai.request(server)
                .post('/forum')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ forum_name: 'testForum4' })
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.be.an('object').that.has.property('success').that.is.a('boolean').that.equals(true)
                    done()
                })
        })
        it('should return with 201 status code and success true', (done) => {
            chai.request(server)
                .post('/forum')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ forum_name: 'testForum5' })
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.be.an('object').that.has.property('success').that.is.a('boolean').that.equals(true)
                    done()
                })
        })
        it('should return with 201 status code and success true', (done) => {
            chai.request(server)
                .post('/forum')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ forum_name: 'testForum6' })
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.be.an('object').that.has.property('success').that.is.a('boolean').that.equals(true)
                    done()
                })
        })
        it('should return with 201 status code and success true', (done) => {
            chai.request(server)
                .post('/forum')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ forum_name: 'testForum7' })
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.be.an('object').that.has.property('success').that.is.a('boolean').that.equals(true)
                    done()
                })
        })
        it('should return with 201 status code and success true', (done) => {
            chai.request(server)
                .post('/forum')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ forum_name: 'testForum8' })
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.be.an('object').that.has.property('success').that.is.a('boolean').that.equals(true)
                    done()
                })
        })
        it('should return with 201 status code and success true', (done) => {
            chai.request(server)
                .post('/forum')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ forum_name: 'testForum9' })
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.be.an('object').that.has.property('success').that.is.a('boolean').that.equals(true)
                    done()
                })
        })
        it('should return with 201 status code and success true', (done) => {
            chai.request(server)
                .post('/forum')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ forum_name: 'testForum10' })
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.be.an('object').that.has.property('success').that.is.a('boolean').that.equals(true)
                    done()
                })
        })
        it('should return with 201 status code and success true', (done) => {
            chai.request(server)
                .post('/forum')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ forum_name: 'testForum11' })
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.be.an('object').that.has.property('success').that.is.a('boolean').that.equals(true)
                    done()
                })
        })
        it('should return with 200 status code and an array with 5 forums', (done) => {
            chai.request(server)
                .get('/forum/recommendForums')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('array').lengthOf(5)
                    done()
                })
        })
        it('should return with 200 status code and an array with 2 forums', (done) => {
            chai.request(server)
                .get('/forum/recommendForums?numberOfForums=2')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('array').lengthOf(2)
                    done()
                })
        })
        it('should return with 200 status code and an array with 9 forums', (done) => {
            chai.request(server)
                .get('/forum/recommendForums?numberOfForums=9')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('array').lengthOf(9)
                    done()
                })
        })
        it('should return with 200 status code and an array with 11 forums', (done) => {
            chai.request(server)
                .get('/forum/recommendForums?numberOfForums=100')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('array').lengthOf(11)
                    done()
                })
        })
    })
    describe('/forum/ban POST route tests', () => {
        it('should return with 200 status code and success true', (done) => {
            chai.request(server)
                .post('/forum/ban')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ forum_id: forumId, user_name: 'otherTestUser' })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.equals('User banned from forum')
                    done()
                })
        })
        it('should return with 200 status code and the forum with blacklisted user', (done) => {
            chai.request(server)
                .get('/forum/' + forumId)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('array').lengthOf(1)
                    res.body[0].should.have.property('blacklist').that.is.an('array').lengthOf(1)
                    done()
                })
        })
        it('should return with 403 status code and a message', (done) => {
            chai.request(server)
                .get('/forum/getAllThreads/' + forumId)
                .set({ authorization: 'Bearer ' + otherUserToken })
                .end((err, res) => {
                    res.should.have.status(403)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.equals('You are banned from this forum!')
                    done()
                })
        })
        it('should return with 200 status code and success true', (done) => {
            chai.request(server)
                .put('/forum/ban')
                .set({ authorization: 'Bearer ' + userToken })
                .send({ forum_id: forumId, user_name: 'otherTestUser' })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .that.equals('User unbanned from forum')
                    done()
                })
        })
        it('should return with 200 status code and the forums data', (done) => {
            chai.request(server)
                .get('/forum/getAllThreads/' + forumId)
                .set({ authorization: 'Bearer ' + otherUserToken })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('array').that.has.lengthOf(1)
                    done()
                })
        })
    })
    describe('forum controller tests while there is no token in the headers', () => {
        describe('/forum POST route tests', () => {
            it('should return with 401 status code and error message', (done) => {
                chai.request(server)
                    .post('/forum')
                    .set({ authorization: 'Bearer ' })
                    .send({ forum_name: 'testForum' })
                    .end((err, res) => {
                        res.should.have.status(401)
                        res.body.should.be
                            .an('object')
                            .that.has.property('message')
                            .that.is.a('string')
                            .equals('You have no permission to use path: /forum')
                        done()
                    })
            })
            it('should return with 200 status code', (done) => {
                chai.request(server)
                    .get('/forum/getAllThreads/' + forumId)
                    .set({ authorization: 'Bearer null' })
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.body.should.be.an('array').that.has.lengthOf(1)
                        res.body[0].should.be.an('object')
                        done()
                    })
            })
            it('should return with 401 status code and error message', (done) => {
                chai.request(server)
                    .put('/forum/' + forumId)
                    .set({ authorization: 'Bearer ' })
                    .send({ forum_name: 'testForumUpdated' })
                    .end((err, res) => {
                        res.should.have.status(401)
                        res.body.should.be
                            .an('object')
                            .that.has.property('message')
                            .that.is.a('string')
                            .equals('You have no permission to use path: /forum/' + forumId)
                        done()
                    })
            })
        })
    })
    describe('/forum DELETE route tests', () => {
        it('should return with 401 status code and error message', (done) => {
            chai.request(server)
                .delete('/forum/')
                .set({ authorization: 'Bearer ' + otherUserToken, forumname: 'testForumUpdated' })
                .end((err, res) => {
                    res.should.have.status(401)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .equals('You are not authorized to delete this forum')
                    done()
                })
        })
        it('should return with 200 status code and message that everything is ok', (done) => {
            chai.request(server)
                .delete('/forum/')
                .set({ authorization: 'Bearer ' + userToken, forumname: 'testForumUpdated' })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .equals('Forum deleted')
                    done()
                })
        })
        it('should return with 404 status code and error message', (done) => {
            chai.request(server)
                .delete('/forum/')
                .set({ authorization: 'Bearer ' + userToken, forumname: 'testForumUpdated' })
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .equals('No forum found')
                    done()
                })
        })
        it('should return with 401 status code and error message', (done) => {
            chai.request(server)
                .delete('/forum')
                .set({ authorization: 'Bearer ', forumname: 'testForumUpdated' })
                .end((err, res) => {
                    res.should.have.status(401)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .equals('You have no permission to use path: /forum')
                    done()
                })
        })
    })
    describe('threadController tests while there is no token in the headers', () => {
        it('should return with 401 status code', (done) => {
            chai.request(server)
                .post('/thread')
                .set({ authorization: 'Bearer ' })
                .send({ forum_name: 'testForum', name: 'testThread', images: [], content: 'Some random text' })
                .end((err, res) => {
                    res.should.have.status(401)
                    res.body.should.be
                        .an('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .equals('You have no permission to use path: /thread')
                    done()
                })
        })
    })
})
