const express = require('express')
const router = express.Router()

const upload = require('../../../middleware/multer')

const adminController = require('../../../controllers/apis/admin-controller')
const categoryController = require('../../../controllers/apis/category-controller')

// Restaurants
router.get('/restaurants', adminController.getRestaurants)
router.get('/restaurants/:id', adminController.getRestaurant)
router.put(
  '/restaurants/:id',
  upload.single('image'),
  adminController.putRestaurant
)
router.post('/restaurants', upload.single('image'), adminController.postRestaurant)
router.delete('/restaurants/:id', adminController.deleteRestaurant)

// Users
router.get('/users', adminController.getUsers)
router.patch('/users/:id', adminController.patchUser)

// Categories
router.get('/categories', adminController.getCategories)
router.post('/categories', categoryController.postCategory)
router.get('/categories/:id', categoryController.getCategories)
router.put('/categories/:id', categoryController.putCategory)
// router.get(
//   '/categories/check-attachment/:id',
//   categoryController.checkAttachment
// )
// router.delete('/categories/:id', categoryController.deleteCategory)

module.exports = router
