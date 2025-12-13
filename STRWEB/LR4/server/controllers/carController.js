const Car = require('../models/Car');

// Get all cars
exports.getAllCars = async (req, res) => {
    try {
        const cars = await Car.find().populate('currentLocation');
        res.json(cars);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get a single car by ID
exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id).populate('currentLocation');
        if (!car) {
            return res.status(404).json({ msg: 'Car not found' });
        }
        res.json(car);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Car not found' });
        }
        res.status(500).send('Server Error');
    }
};

// Create a new car
exports.createCar = async (req, res) => {
    const { brand, model, year, licensePlate, category, dailyRate, status, imageUrl, currentLocation } = req.body;

    try {
        const newCar = new Car({
            brand,
            model,
            year,
            licensePlate,
            category,
            dailyRate,
            status,
            imageUrl,
            currentLocation
        });

        const car = await newCar.save();
        res.json(car);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update a car
exports.updateCar = async (req, res) => {
    const { brand, model, year, licensePlate, category, dailyRate, status, imageUrl, currentLocation } = req.body;

    // Build car object
    const carFields = {};
    if (brand) carFields.brand = brand;
    if (model) carFields.model = model;
    if (year) carFields.year = year;
    if (licensePlate) carFields.licensePlate = licensePlate;
    if (category) carFields.category = category;
    if (dailyRate) carFields.dailyRate = dailyRate;
    if (status) carFields.status = status;
    if (imageUrl) carFields.imageUrl = imageUrl;
    if (currentLocation) carFields.currentLocation = currentLocation;

    try {
        let car = await Car.findById(req.params.id);

        if (!car) return res.status(404).json({ msg: 'Car not found' });

        car = await Car.findByIdAndUpdate(
            req.params.id,
            { $set: carFields },
            { new: true }
        );

        res.json(car);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete a car
exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);

        if (!car) return res.status(404).json({ msg: 'Car not found' });

        await Car.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Car removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Car not found' });
        }
        res.status(500).send('Server Error');
    }
};
