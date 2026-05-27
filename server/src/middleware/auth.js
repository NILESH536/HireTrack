const passport = require('passport');

/**
 * JWT authentication middleware.
 * Attaches the authenticated user to req.user.
 */
const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = { authenticate };
