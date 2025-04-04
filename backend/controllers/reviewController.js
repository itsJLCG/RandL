const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// Get all reviews for a specific product
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate({
        path: 'user',
        select: 'name avatar'
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Get Product Reviews Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get all reviews by the current user
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate({
        path: 'product',
        select: 'name images price'
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Get User Reviews Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create a new review or update if exists
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if user has a delivered order with this product
    const order = await Order.findOne({
      user: req.user._id,
      'orderItems.product': productId,
      status: 'Delivered'
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        error: 'You can only review products from delivered orders'
      });
    }

    // Create or update review
    const review = await Review.findOneAndUpdate(
      { user: req.user._id, product: productId },
      { rating, comment },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Create Review Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get single review by ID
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name avatar'
      })
      .populate({
        path: 'product',
        select: 'name images price'
      });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Get Review Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Check if the review belongs to the user
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to update this review'
      });
    }

    review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, comment },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Update Review Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Check if the review belongs to the user or if the user is an admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to delete this review'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete Review Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};