// middleware/auth.middleware.js
const isAuthenticated = (req, res, next) => {
  console.log("Called")
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

module.exports = isAuthenticated ;
