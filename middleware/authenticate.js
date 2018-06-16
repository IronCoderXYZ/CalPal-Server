const User = require('../models/user');

const authenticateUser = (req, res, next) => {
  const token = req.header('x-auth');
  User.findByToken(token)
    .then(user => {
      if (!user) return Promise.reject('Authorization error, please try again');
      req.user = user;
      req.token = token;
      next();
    })
    .catch(error => res.status(401).send(error));
};

module.exports = authenticateUser;
