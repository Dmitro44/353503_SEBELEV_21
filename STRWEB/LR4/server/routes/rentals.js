const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// --- Customer Routes ---

// @route   POST api/rentals
// @desc    Create a new rental request
// @access  Private
router.post('/', authMiddleware, rentalController.createRental);

// @route   GET api/rentals/my-rentals
// @desc    Get current user's rentals
// @access  Private
router.get('/my-rentals', authMiddleware, rentalController.getMyRentals);


// --- Admin Routes ---

// @route   GET api/rentals/pending
// @desc    Get all rentals pending approval
// @access  Admin
router.get('/pending', [authMiddleware, adminMiddleware], rentalController.getPendingRentals);

// @route   PUT api/rentals/:id/approve
// @desc    Approve a rental request
// @access  Admin
router.put('/:id/approve', [authMiddleware, adminMiddleware], rentalController.approveRental);

// @route   PUT api/rentals/:id/reject
// @desc    Reject a rental request
// @access  Admin
router.put('/:id/reject', [authMiddleware, adminMiddleware], rentalController.rejectRental);

// @route   POST api/rentals/:id/complete
// @desc    Complete a rental (process return)
// @access  Admin
router.post('/:id/complete', [authMiddleware, adminMiddleware], rentalController.completeRental);


module.exports = router;
