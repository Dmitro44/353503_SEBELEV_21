const Car = require('../models/Car');
const Rental = require('../models/Rental');
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

        const activeRentals = await Rental.find({ status: 'active' });
        const rentalMap = new Map();
        activeRentals.forEach(rental => {
            rentalMap.set(rental.car.toString(), rental._id.toString());
        });

        const carsWithRentalInfo = cars.map(car => {
            const carObj = car.toObject();
            if (carObj.status === 'rented' && rentalMap.has(carObj._id.toString())) {
                carObj.activeRentalId = rentalMap.get(carObj._id.toString());
            }
            return carObj;
        });
            
        res.json(carsWithRentalInfo);
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

    const errors = {};
    if (!brand) errors.brand = 'Марка обязательна';
    if (!model) errors.model = 'Модель обязательна';
    if (!year || isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1)
        errors.year = 'Некорректный год (1900 - ' + (new Date().getFullYear() + 1) + ')';

    if (!licensePlate)
        errors.licensePlate = 'Гос. номер обязателен';
    else if (!/^[АВЕКМНОРСТУХABEKMHOPCTYX]\d{3}(?<!000)[АВЕКМНОРСТУХABEKMHOPCTYX]{2}\d{2,3}$/i.test(licensePlate))
        errors.licensePlate = 'Некорректный формат гос. номера (например, А123ВВ77)';

    if (!dailyRate || isNaN(dailyRate) || parseFloat(dailyRate) <= 0)
        errors.dailyRate = 'Цена должна быть положительным числом';
    if (!category || !['Sedan', 'SUV', 'Truck', 'Van', 'Luxury', 'Sport'].includes(category))
        errors.category = 'Некорректная категория';
    if (!status || !['available', 'rented', 'maintenance'].includes(status))
        errors.status = 'Некорректный статус';

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'Image file is required' });
        }

        const existingCar = await Car.findOne({ licensePlate });
        if (existingCar) {
            return res.status(400).json({ msg: 'Автомобиль с таким гос. номером уже существует.' });
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
    const errors = {};
    const currentYear = new Date().getFullYear();

    if (brand) carFields.brand = brand; else errors.brand = 'Марка обязательна';
    if (model) carFields.model = model; else errors.model = 'Модель обязательна';
    
    if (year) {
        if (isNaN(year) || year < 1900 || year > currentYear + 1) errors.year = `Некорректный год (1900 - ${currentYear + 1})`;
        else carFields.year = year;
    } else errors.year = 'Год обязателен';

    if (licensePlate) {
        if (!/^[АВЕКМНОРСТУХABEKMHOPCTYX]\d{3}(?<!000)[АВЕКМНОРСТУХABEKMHOPCTYX]{2}\d{2,3}$/i.test(licensePlate)) errors.licensePlate = 'Некорректный формат гос. номера (например, А123ВВ77)';
        else carFields.licensePlate = licensePlate;
    } else errors.licensePlate = 'Гос. номер обязателен';

    if (dailyRate) {
        if (isNaN(dailyRate) || parseFloat(dailyRate) <= 0) errors.dailyRate = 'Цена должна быть положительным числом';
        else carFields.dailyRate = dailyRate;
    } else errors.dailyRate = 'Цена в день обязательна';

    if (category) {
        if (!['Sedan', 'SUV', 'Truck', 'Van', 'Luxury', 'Sport'].includes(category)) errors.category = 'Некорректная категория';
        else carFields.category = category;
    } else errors.category = 'Категория обязательна';

    if (status) {
        if (!['available', 'rented', 'maintenance'].includes(status)) errors.status = 'Некорректный статус';
        else carFields.status = status;
    } else errors.status = 'Статус обязателен';

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

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

        if (licensePlate && licensePlate !== car.licensePlate) {
            const existingCar = await Car.findOne({ licensePlate });
            if (existingCar) {
                return res.status(400).json({ msg: 'Автомобиль с таким гос. номером уже существует.' });
            }
        }

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

exports.addMaintenanceRecord = async (req, res) => {
    const { notes } = req.body;

    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ msg: 'Car not found' });
        }

        if (car.status !== 'available') {
            return res.status(400).json({ msg: 'Car is not available to be sent for maintenance' });
        }

        const newRecord = {
            notes: notes || 'Плановое ТО', // Default notes if not provided
        };

        car.maintenanceHistory.push(newRecord);
        car.status = 'maintenance';

        await car.save();
        res.json(car);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.addDamageRecord = async (req, res) => {
    const { description, estimatedCost } = req.body;

    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ msg: 'Car not found' });
        }

        const newRecord = {
            description,
            estimatedCost: estimatedCost || 0,
        };

        car.damageHistory.push(newRecord);

        await car.save();
        res.json(car);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

