const { Category } = require('../models')

const categoryServices = {
  getCategories: async (req, callback) => {
    try {
      const [category, categories] = await Promise.all([
        req.params.id ? Category.findByPk(req.params.id, { raw: true }) : null,
        Category.findAll({ raw: true })
      ])
      return callback(null, {
        category,
        categories,
        script: 'admin/categories'
      })
    } catch (error) {
      callback(error)
    }
  },

  postCategory: async (req, callback) => {
    try {
      const { name } = req.body
      if (!name) throw new Error('Please enter category name!')
      const newCategory = await Category.findOrCreate({ where: { name } })

      return callback(null, { newCategory })
    } catch (error) {
      callback(error)
    }
  },

  putCategory: async (req, callback) => {
    try {
      const { name } = req.body
      if (!name) throw new Error('Please enter category name!')
      await Category.update({ name }, { where: { id: req.params.id } })
      const updatedCategory = await Category.findByPk(req.params.id)
      return callback(null, { updatedCategory })
    } catch (error) {
      callback(error)
    }
  }
}

module.exports = categoryServices
