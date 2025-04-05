const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createPromotion,
  getPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  getActivePromotions
} = require('../controllers/PromotionController');

// Public routes
router.get('/active', getActivePromotions);

// Admin-only routes
router.route('/')
  .post(protect, authorize('admin'), createPromotion)
  .get(protect, authorize('admin'), getPromotions);

router.route('/:id')
  .get(protect, authorize('admin'), getPromotionById)
  .put(protect, authorize('admin'), updatePromotion)
  .delete(protect, authorize('admin'), deletePromotion);

module.exports = router;