const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  image: {
    public_id: String,
    url: String
  },
  averageRating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add pre-save middleware to validate image
productSchema.pre('save', function(next) {
  if (!this.image || !this.image.public_id || !this.image.url) {
    next(new Error('Product image information is required'));
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);