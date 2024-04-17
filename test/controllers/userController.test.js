const chai = require('chai')
const should = chai.should()
const expect = chai.expect
const chaiHttp = require('chai-http')
const server = require('../../index.js')
const User = require('../../models/userModel.js')

chai.use(chaiHttp)
describe("userController's tests", async () => {
    let userToken
    const ids = []
    const emailTokens = []
    before(async () => {
        await User.deleteMany({})
        await chai.request('http://localhost:8090/api/messages/*').delete('/')
    })
    describe('/register route test', async () => {
        it('should return with 201 statuscode and a token', (done) => {
            chai.request(server)
                .post('/register')
                .send({
                    username: 'randomTestUser',
                    email: 'randomTestUser@randomTestUser.com',
                    password: 'StrongTestPassword1234!',
                })
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.be.a('object')
                    res.body.should.have.property('token')
                    res.body.should.have.property('success')
                    expect(res.body.success).to.be.equal(true)
                    new Promise((r) => setTimeout(r, 2000))
                    done()
                })
        })
        it('should return the emails ids', (done) => {
            chai.request('http://localhost:8090/api/messages')
                .get('/')
                .end((err, res) => {
                    for (const email of res.body) {
                        ids.push(email.id)
                    }
                    done()
                })
        })
        it('should make the ids readable to the backend', async () => {
            for (const id of ids) {
                const res = await chai.request('http://localhost:8090/api/messages/' + id + '/raw').get('/')
                emailTokens.push(res.text.split('verifyEmail/')[1].split('"')[0].replace(/=\r\n/g, ''))
            }
        })
        it('should now validate all the users', async () => {
            for (const emailToken of emailTokens) {
                const valRes = await chai.request(server).get('/verifyEmail/' + emailToken)
            }
        })
        it('should return with 409 and user already exists error', (done) => {
            chai.request(server)
                .post('/register')
                .send({
                    username: 'randomTestUser',
                    email: 'randomTestUser@randomTestUser.com',
                    password: 'StrongTestPassword1234!',
                })
                .end((err, res) => {
                    res.should.have.status(409)
                    res.body.should.be.a('object')
                    res.body.should.have.property('message')
                    expect(res.body.message).to.be.equal('User already exists with: randomTestUser')
                    done()
                })
        })
        it('should return with 409 and too long username error message', (done) => {
            chai.request(server)
                .post('/register')
                .send({
                    username: 'randomTestUserrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
                    email: 'randomTestUser@randomTestUser.com',
                    password: 'StrongTestPassword1234!',
                })
                .end((err, res) => {
                    res.should.have.status(409)
                    res.body.should.be.a('object')
                    res.body.should.have.property('message')
                    expect(res.body.message).to.be.equal('Username is too long')
                    done()
                })
        })
        it('should return with 409 and too short username error message', (done) => {
            chai.request(server)
                .post('/register')
                .send({
                    username: 'r',
                    email: 'randomTestUser@randomTestUser.com',
                    password: 'StrongTestPassword1234!',
                })
                .end((err, res) => {
                    res.should.have.status(409)
                    res.body.should.be.a('object')
                    res.body.should.have.property('message')
                    expect(res.body.message).to.be.equal('Username is too short')
                    done()
                })
        })
        it('should return with 409 and invalid username error message', (done) => {
            chai.request(server)
                .post('/register')
                .send({
                    username: 'deletedUser',
                    email: 'randomTestUser@randomTestUser.com',
                    password: 'StrongTestPassword1234!',
                })
                .end((err, res) => {
                    res.should.have.status(409)
                    res.body.should.be.a('object')
                    res.body.should.have.property('message')
                    expect(res.body.message).to.be.equal('You cannot register with deletedUser username')
                    done()
                })
        })
        it('should return with 409 and you cannot register with deletedUser username error message', (done) => {
            chai.request(server)
                .post('/register')
                .send({
                    username: 'deletedUser_1',
                    email: 'randomTestUser@randomTestUser.com',
                    password: 'StrongTestPassword1234!',
                })
                .end((err, res) => {
                    res.should.have.status(409)
                    res.body.should.be.a('object')
                    res.body.should.have.property('message')
                    expect(res.body.message).to.be.equal('You cannot register with deletedUser username')
                    done()
                })
        })
    })
    describe('/user/:username route test', () => {
        it("should return with 404 statuscode and 'No user found with: testuser' error message", (done) => {
            chai.request(server)
                .get('/user/testuser')
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.should.be.a('object')
                    const message = res.body.message
                    expect(message).to.be.equal('No user found with: testuser')
                    done()
                })
        })
        it('should return with 200 statuscode and the properties of that specific user', (done) => {
            chai.request(server)
                .get('/user/randomTestUser')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('user')
                    res.body.user.should.have.property('chats')
                    res.body.user.should.have.property('profile_image')
                    res.body.user.should.have.property('role')
                    res.body.user.should.have.property('username')
                    res.body.user.should.have.property('friends')
                    res.body.user.should.have.property('friend_requests')
                    res.body.user.should.have.property('sent_friend_requests')
                    res.body.user.should.have.property('hobbies')
                    res.body.user.should.have.property('notifications')
                    res.body.user.should.have.property('created_at')
                    expect(res.body.user.username).to.be.a('string')
                    expect(res.body.user.username).to.be.equal('randomTestUser')
                    expect(res.body.user.chats).to.be.a('array').that.is.empty
                    expect(res.body.user.profile_image).to.be.a('string')
                    expect(res.body.user.profile_image).to.be.equal('default')
                    expect(res.body.user.role).to.be.a('string')
                    expect(res.body.user.role).to.be.equal('user')
                    expect(res.body.user.friends).to.be.a('array').that.is.empty
                    expect(res.body.user.friend_requests).to.be.a('array').that.is.empty
                    expect(res.body.user.sent_friend_requests).to.be.a('array').that.is.empty
                    expect(res.body.user.hobbies).to.be.a('array').that.is.empty
                    expect(res.body.user.notifications).to.be.a('array').that.is.empty
                    expect(res.body.user.created_at).to.be.a('string')
                    done()
                })
        })
    })
    describe('/login route test', () => {
        it('should return with 401 and invalid credentials error message', (done) => {
            chai.request(server)
                .post('/login')
                .send({
                    email: 'sanyiiiii',
                    password: 'iNVALIDpASSWORD4312!',
                })
                .end((err, res) => {
                    res.should.have.status(401)
                    res.body.should.be.a('object')
                    res.body.should.have.property('message')
                    expect(res.body.message).to.be.equal('Email or password is wrong!')
                    done()
                })
        })
        it('should return with 200 and an object with properties: success, userInfo and token', (done) => {
            chai.request(server)
                .post('/login')
                .send({
                    email: 'randomTestUser@randomTestUser.com',
                    password: 'StrongTestPassword1234!',
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('token')
                    expect(res.body.token).to.be.a('string')
                    res.body.should.have.property('success')
                    expect(res.body.success).to.be.equal(true)
                    res.body.should.have.property('userInfo')
                    res.body.userInfo.should.have.property('profile_image').that.is.a('string')
                    res.body.userInfo.should.have.property('role').that.is.a('string')
                    res.body.userInfo.should.have.property('username').that.is.a('string')
                    res.body.userInfo.should.have.property('created_at').that.is.a('string')
                    userToken = res.body.token
                    done()
                })
        })
        it('should return with 403 and you already logged in error message', (done) => {
            chai.request(server)
                .post('/login')
                .set({
                    authorization: 'Bearer fjisdfhbolgkjhsdlfkgjhsldkfjghblskdfjb',
                })
                .send({
                    email: 'randomTestUser@randomTestUser.com',
                    password: 'StrongTestPassword1234!',
                })
                .end((err, res) => {
                    res.should.have.status(403)
                    res.body.should.be.a('object')
                    res.body.should.have.property('message')
                    expect(res.body.message).to.be.equal('User is already logged in!')
                    done()
                })
        })
    })
    describe('/user/addHobby route test', () => {
        it('should return with 401 and not authorized error message', (done) => {
            chai.request(server)
                .post('/user/addHobby')
                .set({ authorization: 'Bearer ' })
                .send({
                    hobbies: 'TestHobby',
                })
                .end((err, res) => {
                    res.should.have.status(401)
                    res.body.should.be
                        .a('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .equal('You have no permission to use path: /user/addHobby')
                    done()
                })
        })
        it('should return with 200 and success true', (done) => {
            chai.request(server)
                .post('/user/addHobby')
                .set({ authorization: 'Bearer ' + userToken })
                .send({
                    hobbies: 'TestHobby',
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be
                        .a('object')
                        .that.has.property('message')
                        .that.is.a('string')
                        .equal('Hobby or hobbies added')
                    done()
                })
        })
    })
})
