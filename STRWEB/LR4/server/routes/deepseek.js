const express = require('express');
const router = express.Router();
const deepseekController = require('../controllers/deepseekController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/deepseek/chat
// @desc    Send a message to DeepSeek API
// @access  Private (or Public, depending on your app's needs)
router.post('/chat', authMiddleware, deepseekController.chatWithDeepSeek);

module.exports = router;