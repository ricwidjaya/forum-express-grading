const { Restaurant, Category } = require('../../models')
const { lineChartData, pieChartData } = require('../../middleware/data-helper')
const adminServices = require('../../services/admin-services')

const adminController = {
  // Restaurants CRUD
  getRestaurants: (req, res, next) => {
    adminServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('admin/restaurants', data))
  },

  getRestaurant: (req, res, next) => {
    adminServices.getRestaurant(req, (err, data) => err ? next(err) : res.render('admin/restaurant', data))
  },

  createRestaurant: async (req, res, next) => {
    adminServices.getCategories(req, (err, data) =>
      err ? next(err) : res.render('admin/create-restaurant', data)
    )
  },

  postRestaurant: (req, res, next) => {
    adminServices.postRestaurant(req, (err, data) => {
      if (err) return next(err)

      req.flash('success_messages', 'restaurant was successfully created')
      return res.redirect('/admin/restaurants')
    })
  },

  editRestaurant: async (req, res, next) => {
    try {
      const [restaurant, categories] = await Promise.all([
        Restaurant.findByPk(req.params.id, {
          raw: true,
          nest: true,
          include: [Category]
        }),
        Category.findAll({ raw: true })
      ])

      if (!restaurant) throw new Error("Restaurant didn't exist!")
      return res.render('admin/edit-restaurant', { restaurant, categories })
    } catch (error) {
      next(error)
    }
  },

  putRestaurant: (req, res, next) => {
    adminServices.putRestaurant(req, (err, data) => {
      if (err) return next(err)

      req.flash(
        'success_messages',
        'restaurant was successfully to update'
      )
      return res.redirect('/admin/restaurants')
    })
  },

  deleteRestaurant: (req, res, next) => {
    adminServices.deleteRestaurant(req, (err, data) =>
      err ? next(err) : res.redirect('/admin/restaurants')
    )
  },

  // Users CRUD
  getUsers: (req, res, next) => {
    adminServices.getUsers(req, (err, data) =>
      err ? next(err) : res.render('admin/users', data)
    )
  },

  patchUser: (req, res, next) => {
    adminServices.patchUser(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '使用者權限變更成功')
      return res.redirect('/admin/users')
    })
  },

  // Restaurant Dashboard
  getDashboard: async (req, res, next) => {
    const restaurants = await Restaurant.findAll({
      include: [Category],
      raw: true,
      nest: true
    })

    return res.render('admin/restaurants-dashboard', {
      restaurants,
      script: 'admin/dashboard',
      style: 'admin/dashboard'
    })
  },

  getChartData: async (req, res, next) => {
    const { type, duration } = req.query
    let data
    if (type === 'restaurant') {
      data = await lineChartData(duration)
    }

    if (type === 'category') {
      data = await pieChartData()
    }

    return res.json(data)
  }
}

module.exports = adminController
