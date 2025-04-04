const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    trim: true,
    maxLength: [50, 'Category name cannot exceed 50 characters'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please add a category description'],
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Category', categorySchema);