const express = require('express')
const router = express.Router()
const passport = require('passport')

const { authenticated, authenticatedAdmin } = require('../../middleware/apiAuth')
const userController = require('../../controllers/apis/user-controller')
const { apiErrorHandler } = require('../../middleware/error-handler')

const restaurants = require('./modules/restaurants')
const admin = require('./modules/admin')

router.use('/admin', authenticated, authenticatedAdmin, admin)
router.use('/restaurants', authenticated, restaurants)

router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)

router.use('/', apiErrorHandler)

module.exports = router
