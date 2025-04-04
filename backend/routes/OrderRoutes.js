const express = require('express');
const router = express.Router();
const { 
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder
} = require('../controllers/OrderController');
const { protect, authorize } = require('../middleware/auth');

// All routes need authentication
router.use(protect);

// Customer and admin routes
router.route('/')
  .post(createOrder)
  .get(getOrders);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/cancel')
  .put(cancelOrder);

// Admin only routes
router.route('/:id/status')
  .put(authorize('admin'), updateOrderStatus);

router.route('/:id/pay')
  .put(authorize('admin'), updatePaymentStatus);

module.exports = router;