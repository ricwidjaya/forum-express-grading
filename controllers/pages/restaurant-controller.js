const { Restaurant, Category, View, User, Comment } = require('../../models')

const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },

  getRestaurant: async (req, res, next) => {
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

      return res.render('restaurant', {
        restaurant: restaurant.toJSON(),
        isFavorited,
        isLiked
      })
    } catch (error) {
      next(error)
    }
  },

  getDashboard: async (req, res, next) => {
    try {
      const restaurantId = req.params.id
      const [restaurant, comments] = await Promise.all([
        Restaurant.findByPk(restaurantId, {
          include: Category,
          raw: true,
          nest: true
        }),

        Comment.findAndCountAll({
          where: { restaurantId }
        })
      ])

      return res.render('dashboard', {
        restaurant,
        commentCounts: comments.count
      })
    } catch (error) {
      next(error)
    }
  },

  // Feeds
  getFeeds: async (req, res, next) => {
    try {
      const [restaurants, comments] = await Promise.all([
        Restaurant.findAll({
          include: [Category],
          limit: 10,
          order: [['createdAt', 'DESC']],
          raw: true,
          nest: true
        }),
        Comment.findAll({
          include: [User, Restaurant],
          limit: 10,
          order: [['createdAt', 'DESC']],
          raw: true,
          nest: true
        })
      ])

      return res.render('feeds', { restaurants, comments })
    } catch (error) {
      next(error)
    }
  },

  getTopRestaurants: async (req, res, next) => {
    const rawRestaurants = await Restaurant.findAll({
      include: [
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' }
      ]
    })

    const restaurants = rawRestaurants.map(r => ({
      ...r.toJSON(),
      favoritedCount: r.FavoritedUsers.length,
      isFavorited: req.user && req.user.FavoritedRestaurants.some(fr => fr.id === r.id)
    }))

    // Sort restaurants by favoritedCount and only return the highest 10
    restaurants.sort((a, b) => b.favoritedCount - a.favoritedCount)
    restaurants.splice(10)

    return res.render('top-restaurants', { restaurants })
  }
}

module.exports = restaurantController
