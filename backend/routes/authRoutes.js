const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  login, 
  signup, 
  getProfile, 
  updateProfile 
} = require('../controllers/authController');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile); // Changed from /me to /profile
router.put('/update-profile', protect, updateProfile);

module.exports = router;