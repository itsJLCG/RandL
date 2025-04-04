const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProductReviews,
  getUserReviews,
  createReview,
  getReviewById,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.use(protect);
router.get('/me', getUserReviews);
router.post('/', createReview);
router.get('/:id', getReviewById);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;