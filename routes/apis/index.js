const express = require('express')
const router = express.Router()

const restaurants = require('./modules/restaurants')
const admin = require('./modules/admin')

router.use('/admin', admin)
router.use('/restaurants', restaurants)

module.exports = router
