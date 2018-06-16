const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  name: {
    trim: true,
    type: String,
    required: true
  },
  calories: {
    trim: true,
    type: Number,
    required: true
  },
  author: {
    trim: true,
    type: String,
    required: true
  }
});

FoodSchema.statics.findByAuthor = function(author) {
  const Food = this;
  return Food.find({ author });
};

const Food = mongoose.model('Food', FoodSchema);

module.exports = Food;
