const { User, Restaurant, Comment, Favorite, Like, Followship } = require('../../models')
// import db for using db function
const db = require('../../models/index')

const userServices = require('../../services/user-services')
const { imgurFileHandler } = require('../../middleware/file-helpers')

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '成功註冊帳號！')
      return res.redirect('/signin')
    })
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    return res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    return res.redirect('/signin')
  },

  // User profile
  getUser: async (req, res, next) => {
    try {
      const userId = req.params.id
      const [rawUser, comments] = await Promise.all([
        User.findByPk(userId, {
          include: [
            { model: User, as: 'Followers' },
            { model: User, as: 'Followings' },
            { model: Restaurant, as: 'FavoritedRestaurants' }
          ]
        }),

        // Get unique commented restaurants
        // ===== SQL command below ====
        // SELECT
        //     COUNT(restaurant_id) AS `comments`,
        //     restaurant_id,
        //     user_id
        // FROM comments
        // WHERE user_id = {user.id}
        // GROUP BY restaurant_id;
        Comment.findAll({
          where: { userId },
          attributes: [
            'restaurant_id',
            [
              db.sequelize.fn('count', db.sequelize.col('restaurant_id')),
              'comments'
            ]
          ],
          include: [Restaurant],
          group: ['restaurant_id'],
          raw: true,
          nest: true
        })
      ])

      const totalComments = comments.reduce(
        (acc, curr) => acc + curr.comments,
        comments[0].comments
      )

      const user = {
        ...rawUser.toJSON(),
        followerCount: rawUser.Followers.length,
        followingCount: rawUser.Followings.length,
        FavoritedRestaurantsCount: rawUser.FavoritedRestaurants.length
      }

      return res.render('users/profile', {
        user,
        comments,
        commentedRestaurants: comments.length,
        totalComments
      })
    } catch (error) {
      next(error)
    }
  },

  editUser: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id, { raw: true })

      return res.render('users/edit', { user })
    } catch (error) {
      next(error)
    }
  },

  putUser: async (req, res, next) => {
    try {
      const { name } = req.body
      const { id } = req.params
      if (!name) throw new Error('User name is required!')

      const { file } = req
      const [filePath, user] = await Promise.all([
        imgurFileHandler(file),
        User.findByPk(id)
      ])

      await user.update({
        name,
        image: filePath || user.image
      })

      req.flash('success_messages', '使用者資料編輯成功')
      return res.redirect(`/users/${id}`)
    } catch (error) {
      next(error)
    }
  },

  // Favorite feature
  addFavorite: async (req, res, next) => {
    try {
      const { restaurantId } = req.params
      const [restaurant, favorite] = await Promise.all([
        Restaurant.findByPk(restaurantId),
        Favorite.findOne({
          where: {
            restaurantId,
            userId: req.user.id
          }
        })
      ])

      if (!restaurant) throw new Error("Restaurant didn't exist!")
      if (favorite) throw new Error('You have favorited this restaurant!')

      await Favorite.create({
        restaurantId,
        userId: req.user.id
      })

      return res.redirect('back')
    } catch (error) {
      next(error)
    }
  },

  removeFavorite: async (req, res, next) => {
    try {
      const favorite = await Favorite.findOne({
        where: {
          userId: req.user.id,
          restaurantId: req.params.restaurantId
        }
      })

      if (!favorite) throw new Error("You haven't favorited this restaurant")

      await favorite.destroy()

      return res.redirect('back')
    } catch (error) {
      next(error)
    }
  },

  // Like feature
  addLike: async (req, res, next) => {
    try {
      const { restaurantId } = req.params
      const [restaurant, like] = await Promise.all([
        Restaurant.findByPk(restaurantId),
        Like.findOne({
          where: {
            restaurantId,
            userId: req.user.id
          }
        })
      ])

      if (!restaurant) throw new Error("Restaurant didn't exist!")
      if (like) throw new Error('You have liked this restaurant!')

      await Like.create({
        restaurantId,
        userId: req.user.id
      })

      return res.redirect('back')
    } catch (error) {
      next(error)
    }
  },

  removeLike: async (req, res, next) => {
    try {
      const like = await Like.findOne({
        where: {
          restaurantId: req.params.restaurantId,
          userId: req.user.id
        }
      })

      if (!like) throw new Error("You haven't liked this restaurant")

      await like.destroy()

      return res.redirect('back')
    } catch (error) {
      next(error)
    }
  },

  getTopUsers: async (req, res, next) => {
    try {
      const rawUsers = await User.findAll({
        include: [{ model: User, as: 'Followers' }]
      })

      const users = rawUsers.map(user => ({
        ...user.toJSON(),
        followerCount: user.Followers.length,
        isFollowed: req.user.Followings.some(uf => uf.id === user.id)
      }))

      users.sort((a, b) => b.followerCount - a.followerCount)

      return res.render('top-users', { users })
    } catch (error) {
      next(error)
    }
  },

  // Following
  addFollowing: async (req, res, next) => {
    try {
      const { userId } = req.params

      if (Number(userId) === req.user.id) throw new Error("You can't follow yourself.")
      const user = await User.findByPk(userId)
      if (!user) throw new Error("User didn't exist!")

      await Followship.findOrCreate({
        where: {
          followerId: req.user.id,
          followingId: userId
        }
      })

      return res.redirect('back')
    } catch (error) {
      next(error)
    }
  },

  removeFollowing: async (req, res, next) => {
    try {
      const followship = await Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: req.params.userId
        }
      })

      if (!followship) throw new Error("You haven't followed this user!")

      await followship.destroy()
      return res.redirect('back')
    } catch (error) {
      next(error)
    }
  }
}

module.exports = userController
