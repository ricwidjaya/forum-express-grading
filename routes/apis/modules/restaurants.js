const express = require('express')
const router = express.Router()

const restController = require('../../../controllers/apis/restaurant-controller')

router.get('/', restController.getRestaurants)
router.get('/:id', restController.getRestaurant)

module.exports = router
