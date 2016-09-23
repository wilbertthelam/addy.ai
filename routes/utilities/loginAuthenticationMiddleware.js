// universal check authentication method
exports.isAuthenticated = function (req, res, next) {
  if (req.session.userId) {
    return next();
  }
  return res.redirect('/football/login/notLoggedIn');
};