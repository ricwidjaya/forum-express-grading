const { Restaurant, Category, User, Comment, View } = require('../models')
const {
  getOffset,
  getPagination
} = require('../middleware/pagination-helper')

const restaurantServices = {
  getRestaurants: async (req, callback) => {
    try {
      const DEFAULT_LIMIT = 9
      const categoryId = Number(req.query.categoryId) || ''
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || DEFAULT_LIMIT

      const offset = getOffset(limit, page)

      const [restaurants, categories] = await Promise.all([
        Restaurant.findAndCountAll({
          where: { ...(categoryId ? { categoryId } : {}) },
          include: Category,
          limit,
          offset,
          raw: true,
          nest: true
        }),
        Category.findAll({ raw: true })
      ])

      // Cleaning restaurant data
      const favoritedRestaurantIds = req.user
        ? req.user.FavoritedRestaurants.map(fr => fr.id)
        : []
      const likedRestaurantIds = req.user
        ? req.user.LikedRestaurants.map(lr => lr.id)
        : []

      const restData = restaurants.rows.map(r => ({
        ...r,
        isFavorited: favoritedRestaurantIds.includes(r.id),
        isLiked: likedRestaurantIds.includes(r.id)
      }))

      return callback(null, {
        restaurants: restData,
        categories,
        categoryId,
        pagination: getPagination(limit, page, restaurants.count)
      })
    } catch (error) {
      callback(error)
    }
  },

  getRestaurant: async (req, callback) => {
    try {
      // Eager Loading (JOIN)
      const restInstance = await Restaurant.findByPk(req.params.id, {
        include: [
          Category,
          { model: Comment, include: User },
          { model: User, as: 'FavoritedUsers' },
          { model: User, as: 'LikedUsers' }
        ],
        order: [[Comment, 'createdAt', 'DESC']]
      })

      if (!restInstance) throw new Error("Restaurant didn't exist!")

      const isFavorited = restInstance.FavoritedUsers.some(
        fu => fu.id === req.user.id
      )
      const isLiked = restInstance.LikedUsers.some(lu => lu.id === req.user.id)
      // Update view count on restaurant
      const restaurant = await restInstance.increment('view_counts')

      // Update view data
      await View.create({
        userId: req.user.id,
        restaurantId: req.params.id
      })

      return callback(null, {
        restaurant: restaurant.toJSON(),
        isFavorited,
        isLiked
      })
    } catch (error) {
      callback(error)
    }
  }
}

module.exports = restaurantServices
