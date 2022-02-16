const { Restaurant, Category } = require('../../models')
const { isAttached } = require('../../middleware/data-helper')

const categoryServices = require('../../services/category-services')

const categoryController = {
  getCategories: (req, res, next) => {
    categoryServices.getCategories(req, (err, data) =>
      err ? next(err) : res.render('admin/categories', data)
    )
  },

  postCategory: (req, res, next) => {
    categoryServices.postCategory(req, (err, data) => err ? next(err) : res.redirect('/admin/categories'))
  },

  putCategory: (req, res, next) => {
    categoryServices.putCategory(req, (err, data) => err ? next(err) : res.redirect('/admin/categories'))
  },

  deleteCategory: async (req, res, next) => {
    // Check delete method
    try {
      const categoryId = req.params.id
      const deleteOption = req.query.option || null

      // No attach, delete category directly
      if (!deleteOption) await Category.destroy({ where: { id: categoryId } })

      // Delete category along with all restaurant
      if (deleteOption === 'deleteAll') {
        await Restaurant.destroy({ where: { categoryId } })
        await Category.destroy({ where: { id: categoryId } })
      }

      // Delete category and replace it with '未分類'
      if (deleteOption === 'replace') {
        // Find '未分類' category id or create one if not found
        // eslint-disable-next-line no-unused-vars
        const [nullCategory, _created] = await Category.findOrCreate({ where: { name: '未分類' } })

        // Replace restaurants' category id with replace id
        await Restaurant.update(
          { categoryId: nullCategory.id },
          { where: { categoryId } }
        )

        // Delete original category
        await Category.destroy({ where: { id: categoryId } })
      }

      return res.redirect('/admin/categories')
    } catch (error) {
      next(error)
    }
  },

  // Check if category is attached to any restaurant
  checkAttachment: async (req, res, next) => {
    try {
      // Find if any restaurant is attached to this category (Reference middleware/data-helper.js)
      if (await isAttached(req.params.id, Restaurant, 'categoryId')) {
        return res.json(true)
      }
      return res.json(false)
      // If so, ask admin to decide how to keep it or delete it
    } catch (error) {
      next(error)
    }
  }
}

module.exports = categoryController
