const { Restaurant, Category, User } = require('../models')
const { isSuperUser } = require('../helpers/auth-helpers')
const { imgurFileHandler } = require('../middleware/file-helpers')

const adminServices = {
  // Restaurants CRUD
  getRestaurants: async (req, callback) => {
    try {
      const restaurants = await Restaurant.findAll({
        raw: true,
        nest: true,
        include: [Category]
      })
      return callback(null, { restaurants })
    } catch (error) {
      callback(error)
    }
  },

  getRestaurant: async (req, callback) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, {
        raw: true,
        nest: true,
        include: [Category]
      })

      if (!restaurant) throw new Error("Restaurant didn't exist!")

      return callback(null, {
        restaurant
      })
    } catch (error) {
      callback(error)
    }
  },

  getCategories: async (req, callback) => {
    try {
      const categories = await Category.findAll({ raw: true })
      return callback(null, { categories })
    } catch (error) {
      callback(error)
    }
  },

  postRestaurant: async (req, callback) => {
    try {
      const { name, tel, address, openingHours, description, categoryId } =
        req.body
      if (!name) throw new Error('Restaurant name is required!')

      const { file } = req

      const filePath = await imgurFileHandler(file)

      const restaurant = await Restaurant.create({
        name,
        tel,
        address,
        openingHours,
        description,
        categoryId,
        image: filePath || null
      })

      return callback(null, { restaurant })
    } catch (error) {
      callback(error)
    }
  },

  putRestaurant: async (req, callback) => {
    try {
      const { name, tel, address, openingHours, description, categoryId } =
        req.body
      if (!name) throw new Error('Restaurant name is required!')

      const { file } = req

      const [restaurant, filePath] = await Promise.all([
        Restaurant.findByPk(req.params.id),
        imgurFileHandler(file)
      ])
      // Keep sequelize class to update data

      if (!restaurant) throw new Error("Restaurant didn't exist!")
      await restaurant.update({
        name,
        tel,
        address,
        openingHours,
        description,
        categoryId,
        image: filePath || restaurant.image
      })

      return callback(null, { restaurant })
    } catch (error) {
      callback(error)
    }
  },

  deleteRestaurant: async (req, callback) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id)

      if (!restaurant) throw new Error("Restaurant didn't exist!")

      const deletedRestaurant = await restaurant.destroy()
      return callback(null, { restaurant: deletedRestaurant })
    } catch (error) {
      callback(error)
    }
  },

  // Users CRUD
  getUsers: async (req, callback) => {
    try {
      const users = await User.findAll({ raw: true })

      // remove sensitive info
      users.forEach(user => {
        delete user.password
      })

      return callback(null, {
        users,
        script: 'admin/users',
        user: req.user
      })
    } catch (error) {
      callback(error)
    }
  },

  patchUser: async (req, callback) => {
    try {
      const user = await User.findByPk(req.params.id)

      // Validate user type
      if (!user) throw new Error("User doesn't exist")
      if (isSuperUser(user)) throw new Error('禁止變更 root 權限')

      // Update user access
      const patchedUser = await user.update({ isAdmin: !user.isAdmin })

      return callback(null, { patchedUser })
    } catch (error) {
      callback(error)
    }
  }
}

module.exports = adminServices
