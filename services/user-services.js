const bcrypt = require('bcryptjs')
const { User } = require('../models')

const userServices = {
  signUp: async (req, callback) => {
    try {
      const { name, password, email, passwordCheck } = req.body
      // Double check password
      if (password !== passwordCheck) throw new Error('Passwords do not match!')

      // Check if user exists
      const user = await User.findOne({ where: { email } })

      if (user) throw new Error('Email already exists!')
      const hash = bcrypt.hashSync(password, 10)

      const newUser = await User.create({
        name,
        email,
        password: hash
      })

      return callback(null, {
        newUser
      })
    } catch (error) {
      callback(error)
    }
  }
}

module.exports = userServices
