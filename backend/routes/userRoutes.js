const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUserRole,
  deleteUser
} = require('../controllers/UserController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes & restrict to admin
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(getUsers);

router
  .route('/:id')
  .get(getUser)
  .delete(deleteUser);

router
  .route('/:id/role')
  .put(updateUserRole);

module.exports = router;