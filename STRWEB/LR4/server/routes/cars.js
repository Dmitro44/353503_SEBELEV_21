const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { uploadDisk } = require('../middleware/uploadMiddleware');

// @route   GET api/cars
// @desc    Get all cars
// @access  Public
router.get('/', carController.getAllCars);

// @route   GET api/cars/:id
// @desc    Get a single car by ID
// @access  Public
router.get('/:id', carController.getCarById);

// @route   POST api/cars
// @desc    Create a new car
// @access  Admin
router.post('/', [authMiddleware, adminMiddleware, uploadDisk.single('image')], carController.createCar);

// @route   PUT api/cars/:id
// @desc    Update a car
// @access  Admin
router.put('/:id', [authMiddleware, adminMiddleware, uploadDisk.single('image')], carController.updateCar);

// @route   DELETE api/cars/:id
// @desc    Delete a car
// @access  Admin
router.delete('/:id', [authMiddleware, adminMiddleware], carController.deleteCar);

module.exports = router;
