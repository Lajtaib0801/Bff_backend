const Forum = require('../../models/forumModel')
const tryCatchWrapper = require('../../middlewares/tryCatchWrapper')
const { StatusCodes } = require('http-status-codes')

const recommendForums = tryCatchWrapper(async (req, res) => {
    let numberOfForums = req.query.numberOfForums || 5
    const numberOfDocuments = await Forum.countDocuments()

    if (numberOfDocuments < numberOfForums) {
        numberOfForums = numberOfDocuments
    }

    const randomForums = new Set()
    while (randomForums.size < numberOfForums) {
        let randomNumber = Math.floor(Math.random() * numberOfDocuments)
        const forum = await Forum.findOne().skip(randomNumber).limit(1)
        randomForums.add(JSON.stringify(forum))
    }
    const returnRandomForums = []
    for (const forum of randomForums) {
        returnRandomForums.push(JSON.parse(forum))
    }
    return res.status(StatusCodes.OK).json(returnRandomForums)
})

module.exports = recommendForums
