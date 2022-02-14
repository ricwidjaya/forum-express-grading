const passport = require('../config/passport')

const authenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) { return res.status(401).json({ status: 'error', message: 'unauthorized' }) }
    req.user = user
    next()
  })(req, res, next)
}

const authenticatedAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next()

  return res.status(403).json({ status: 'error', message: 'permission denied' })
}

// const authenticated = (req, res, next) => {
//   const middleware = passport.authenticate('jwt', { session: false }, (err, user) => {
//     if (err || !user) return res.status(401).json({ status: 'error', message: 'user unauthorized' })
//     next()
//   })
//   middleware(req, res, next)
// }

// const authenticatedAdmin = (req, res, next) => {
//   console.log(req.user)
//   if (req.user && req.user.isAdmin) return next()
//   return res.status(403).json({
//     status: 'error',
//     message: 'permission denied'
//   })
// }

module.exports = { authenticated, authenticatedAdmin }
