const jwt = require('jsonwebtoken')

const userServices = require('../../services/user-services')

const userController = {
  signIn: (req, res, next) => {
    try {
      const user = req.user.toJSON()
      delete user.password
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' })
      return res.json({
        status: 'success',
        data: {
          token,
          user
        }
      })
    } catch (error) {
      next(error)
    }
  },

  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) => err
      ? next(err)
      : res.json({
        status: 'success',
        data
      }))
  }
}

module.exports = userController
