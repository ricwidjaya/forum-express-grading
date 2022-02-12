const { Restaurant, Category } = require('../models')

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
  }
}

module.exports = adminServices
