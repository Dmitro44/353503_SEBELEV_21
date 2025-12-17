const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadMemory } = require('../middleware/uploadMiddleware');

// @route   POST api/users/verify-document
// @desc    Verify user document using OCR
// @access  Private
router.post(
    '/verify-document',
    [authMiddleware, uploadMemory.single('document')],
    userController.verifyDocument
);

module.exports = router;
