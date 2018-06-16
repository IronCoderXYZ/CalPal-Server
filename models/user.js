const _ = require('lodash');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { isEmail } = require('validator');

const UserSchema = new mongoose.Schema({
  email: {
    trim: true,
    minlength: 3,
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: isEmail,
      message: 'Please try again, {VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    minlength: 4,
    required: true
  },
  tokens: [
    {
      token: {
        type: String,
        required: true
      },
      access: {
        type: String,
        required: true
      }
    }
  ]
});

UserSchema.pre('Save', function(next) {
  const user = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (error, salt) => {
      bcrypt.hash(user.password, salt, (error, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

UserSchema.statics.findByCredentials = function(email, password) {
  const User = this;

  return User.findOne({ email }).then(user => {
    if (!user) {
      return Promise.reject('User not found');
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (error, isMatch) => {
        if (isMatch) resolve(user);
        reject('Login info incorrect, please try again.');
      });
    });
  });
};

UserSchema.methods.generateAuthToken = function() {
  const user = this;
  const access = 'auth';
  const token = jwt
    .sign({ _id: user._id.toHexString(), acces }, 'abc123')
    .toString();
  user.tokens = user.tokens.concat([{ access, token }]);
  return user.save().then(() => token);
};

const User = mongoose.model('User', UserSchema);

module.exports = user;
