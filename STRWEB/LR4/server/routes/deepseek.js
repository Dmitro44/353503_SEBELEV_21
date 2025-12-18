const express = require('express');
const router = express.Router();
const deepseekController = require('../controllers/deepseekController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/deepseek/chat
// @desc    Send a message to DeepSeek API
// @access  Private (or Public, depending on your app's needs)
router.post('/chat', authMiddleware, deepseekController.chatWithDeepSeek);

// @route   GET api/deepseek/history
// @desc    Get chat history for the authenticated user
// @access  Private
router.get('/history', authMiddleware, deepseekController.getChatHistory);

// @route   DELETE api/deepseek/history
// @desc    Clear chat history for the authenticated user
// @access  Private
router.delete('/history', authMiddleware, deepseekController.clearChatHistory);

module.exports = router;