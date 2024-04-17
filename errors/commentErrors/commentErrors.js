const parentCommentDoesNotExistError = require('./parentCommentDoesNotExistError')
const tooLongCommentError = require('./tooLongCommentError')
const noCommentFoundError = require('./noCommentFoundError')
const cannotDeleteCommentError = require('./cannotDeleteCommentError')
const cannotEditCommentError = require('./cannotEditCommentError')
const cannotEditFieldError = require('./cannotEditFieldError')

module.exports = {
    parentCommentDoesNotExistError,
    tooLongCommentError,
    noCommentFoundError,
    cannotDeleteCommentError,
    cannotEditCommentError,
    cannotEditFieldError
}
