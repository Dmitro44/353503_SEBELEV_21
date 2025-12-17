const Car = require('../models/Car');
const fs = require('fs');
const path = require('path')

exports.getAllCars = async (req, res) => {
    try {
        const { search, category, sortBy, order = 'asc' } = req.query;

        let query = {};

        if (category) {
            query.category = category;
        }

        if (search) {
            const searchTerms = search.split(' ').filter(term => term);
            const regexTerms = searchTerms.map(term => new RegExp(term, 'i'))
            ;
            // Ищем, чтобы каждое слово из поиска было или в марке, или в модели
            query.$and = regexTerms.map(regex => ({
                $or: [
                    { brand: regex },
                    { model: regex }
                ]
            }));
        }

        let sortOptions = {};
        if (sortBy) {
            sortOptions[sortBy] = order === 'desc' ? -1 : 1;
        }

        const cars = await Car.find(query)
            .populate('currentLocation')
            .sort(sortOptions);
            
        res.json(cars);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

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

exports.createCar = async (req, res) => {
    const { brand, model, year, licensePlate, category, dailyRate, status, currentLocation } = req.body;

    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'Image file is required' });
        }

        const imageUrl = '/' + req.file.path.replace(/\\/g, '/');

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

exports.updateCar = async (req, res) => {
    const { brand, model, year, licensePlate, category, dailyRate, status, currentLocation } = req.body;

    const carFields = {};
    if (brand) carFields.brand = brand;
    if (model) carFields.model = model;
    if (year) carFields.year = year;
    if (licensePlate) carFields.licensePlate = licensePlate;
    if (category) carFields.category = category;
    if (dailyRate) carFields.dailyRate = dailyRate;
    if (status) carFields.status = status;
    if (currentLocation) carFields.currentLocation = currentLocation;

    if (req.file) {

        try {
            const oldCar = await Car.findById(req.params.id);
            if (oldCar && oldCar.imageUrl){
                const oldImagePath = path.join(__dirname, '..', oldCar.imageUrl);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        } catch (err) {
            console.error('Unable to delete old car image', err);
        }

        carFields.imageUrl = '/' + req.file.path.replace(/\\/g, '/');
    } else if (req.body.imageUrl) {
        carFields.imageUrl = req.body.imageUrl;
    }

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

exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);

        if (!car) return res.status(404).json({ msg: 'Car not found' });

        if (car.imageUrl) {
            const imagePath = path.join(__dirname, '..', car.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath, (err) => {
                    if (err) {
                        console.error('Unable to delete car image', err);
                    }
                })
            }
        }

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
