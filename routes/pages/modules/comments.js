const express = require('express')
const router = express.Router()

const { authenticated, authenticatedAdmin } = require('../../../middleware/auth')
const commentController = require('../../../controllers/pages/comment-controller')

router.post('/', authenticated, commentController.postComment)
router.delete('/:id', authenticatedAdmin, commentController.deleteComment)

module.exports = router
