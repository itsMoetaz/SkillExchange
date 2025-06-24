const express = require('express');
const { getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get user by ID (for profile viewing)
router.get('/:userId', protect, getUserById);

module.exports = router;