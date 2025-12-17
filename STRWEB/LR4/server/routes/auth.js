const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.register);

// @route   POST api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', authController.login);

// @route   POST api/auth/google
// @desc    Authenticate user with Google
// @access  Public
router.post('/google', authController.googleLogin);

// @route   GET api/auth/me
// @desc    Get current user's data
// @access  Private
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
