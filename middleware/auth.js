const { getUser, ensureAuthenticated } = require('./auth-helpers')

const authenticated = (req, res, next) => {
  if (ensureAuthenticated(req)) {
    return next()
  }
  return res.redirect('/signin')
}

const authenticatedAdmin = (req, res, next) => {
  if (ensureAuthenticated(req)) {
    if (getUser(req).isAdmin) return next()
    return res.redirect('/')
  }
  return res.redirect('/signin')
}

module.exports = { authenticated, authenticatedAdmin }
