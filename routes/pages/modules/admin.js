const express = require('express')
const router = express.Router()

const upload = require('../../../middleware/multer')
const adminController = require('../../../controllers/pages/admin-controller')
const categoryController = require('../../../controllers/pages/category-controller')

// Restaurants
router.get('/restaurants/create', adminController.createRestaurant)
router.get('/restaurants/:id/edit', adminController.editRestaurant)
router.get('/restaurants/:id', adminController.getRestaurant)
router.put('/restaurants/:id', upload.single('image'), adminController.putRestaurant)
router.delete('/restaurants/:id', adminController.deleteRestaurant)
router.get('/restaurants', adminController.getRestaurants)
router.post('/restaurants', upload.single('image'), adminController.postRestaurant)

// Users
router.get('/users', adminController.getUsers)
router.patch('/users/:id', adminController.patchUser)

// Categories
router.get('/categories/check-attachment/:id', categoryController.checkAttachment)
router.get('/categories/:id', categoryController.getCategories)
router.put('/categories/:id', categoryController.putCategory)
router.delete('/categories/:id', categoryController.deleteCategory)
router.post('/categories', categoryController.postCategory)
router.get('/categories', categoryController.getCategories)

// Dashboard
router.get('/dashboard', adminController.getDashboard)
router.get('/dashboard/chart', adminController.getChartData)

// Fallback route
router.use('/', (req, res) => res.redirect('/admin/restaurants'))

module.exports = router