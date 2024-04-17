const chai = require('chai')
const should = chai.should()
const expect = chai.expect
const chaiHttp = require('chai-http')
const server = require('../../index.js')
chai.use(chaiHttp)
const User = require('../../models/userModel.js')
const Forum = require('../../models/forumModel.js')

describe('searchController tests', () => {
    let userToken
    before(async () => {
        await User.deleteMany({})
        await Forum.deleteMany({})
    })
    describe('/search POST route tests', () => {
        it('should return 400 and error message if there is no search keyword', (done) => {
            chai.request(server)
                .post('/search')
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.have
                        .property('message')
                        .that.is.a('string')
                        .that.equals('No search keyword provided')
                    done()
                })
        })

        it('should return 200 and an empty string because the database is empty right now', (done) => {
            chai.request(server)
                .post('/search')
                .send({ keyword: 'test' })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('array').lengthOf(2)
                    res.body[0].should.be.an('array').lengthOf(0)
                    res.body[1].should.be.an('array').lengthOf(0)
                    done()
                })
        })
        it('should create a randomTestUser and forum', async () => {
            const loginRes = await chai.request(server).post('/register').send({
                username: 'randomTestUser',
                email: 'randomTestUser@randomTestUser.com',
                password: 'StrongTestPassword1234!',
            })
            userToken = loginRes.body.token
            await chai
                .request(server)
                .post('/forum')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    forum_name: 'TestForum',
                    banner: 'https://i.imgur.com/d2d234.png',
                })
            await chai
                .request(server)
                .post('/forum')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    forum_name: 'TestForum2',
                    banner: 'https://i.imgur.com/d2d234.png',
                })
            await chai
                .request(server)
                .post('/forum')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    forum_name: 'TestForum3',
                    banner: 'https://i.imgur.com/d2d234.png',
                })
            await chai
                .request(server)
                .post('/forum')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    forum_name: 'TestForum4',
                    banner: 'https://i.imgur.com/d2d234.png',
                })
            await chai
                .request(server)
                .post('/forum')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    forum_name: 'TestForum5',
                    banner: 'https://i.imgur.com/d2d234.png',
                })
            await chai
                .request(server)
                .post('/forum')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    forum_name: 'TestForum6',
                    banner: 'https://i.imgur.com/d2d234.png',
                })
            await chai
                .request(server)
                .post('/forum')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    forum_name: 'TestForum7',
                    banner: 'https://i.imgur.com/d2d234.png',
                })
            await chai
                .request(server)
                .post('/forum')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    forum_name: 'TestForum8',
                    banner: 'https://i.imgur.com/d2d234.png',
                })
            await chai
                .request(server)
                .post('/forum')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    forum_name: 'TestForum9',
                    banner: 'https://i.imgur.com/d2d234.png',
                })
            await chai
                .request(server)
                .post('/forum')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    forum_name: 'TestForum10',
                    banner: 'https://i.imgur.com/d2d234.png',
                })
            await chai
                .request(server)
                .post('/forum')
                .set({
                    authorization: 'Bearer ' + userToken,
                })
                .send({
                    forum_name: 'TestForum11',
                    banner: 'https://i.imgur.com/d2d234.png',
                })
        })
        it('should return 200 and two arrays with ten forums and one user', (done) => {
            chai.request(server)
                .post('/search')
                .send({ keyword: 'test' })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('array').lengthOf(2)
                    res.body[0].should.be.an('array').lengthOf(10)
                    res.body[0][0].should.be.an('object').property('forum_name').that.equals('TestForum')
                    res.body[0][0].should.be
                        .an('object')
                        .property('banner')
                        .that.equals('https://i.imgur.com/d2d234.png')
                    res.body[1].should.be.an('array').lengthOf(1)
                    res.body[1][0].should.be.an('object').property('username').that.equals('randomTestUser')
                    done()
                })
        })
        it('should return 200 and one array with one forum and one user', (done) => {
            chai.request(server)
                .post('/search?limit=1')
                .send({ keyword: 'forum' })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('array').lengthOf(2)
                    res.body[0].should.be.an('array').lengthOf(1)
                    done()
                })
        })
        it('should return 200 and one array with five forums and one user', (done) => {
            chai.request(server)
                .post('/search?limit=5')
                .send({ keyword: 'forum' })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('array').lengthOf(2)
                    res.body[0].should.be.an('array').lengthOf(5)
                    done()
                })
        })
        it('should return 200 and one array with one forum from page 2 and one user', (done) => {
            chai.request(server)
                .post('/search?page=1&limit=1')
                .send({ keyword: 'forum' })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('array').lengthOf(2)
                    res.body[0].should.be.an('array').lengthOf(1)
                    done()
                })
        })
        it('should return 200 and one array with all of the forums and one user', (done) => {
            chai.request(server)
                .post('/search?limit=100')
                .send({ keyword: 'forum' })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('array').lengthOf(2)
                    res.body[0].should.be.an('array').lengthOf(11)
                    done()
                })
        })
    })
})
