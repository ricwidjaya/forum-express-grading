const express = require('express')
const router = express.Router()
const { apiErrorHandler } = require('../../middleware/error-handler')

const restaurants = require('./modules/restaurants')
const admin = require('./modules/admin')

router.use('/admin', admin)
router.use('/restaurants', restaurants)

router.use('/', apiErrorHandler)

module.exports = router
