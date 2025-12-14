const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Car = require('./models/Car');
const Location = require('./models/Location');
const User = require('./models/User');
// const Rental = require('./models/Rental'); // No longer seeding rentals

dotenv.config({ path: __dirname + '/.env' });

const DB_URI = process.env.DB_URI;

const seedDB = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log('MongoDB Connected for seeding...');

        // Clear existing data
        await Car.deleteMany({});
        await Location.deleteMany({});
        await User.deleteMany({});
        // await Rental.deleteMany({}); // No longer clearing rentals
        console.log('Existing data cleared (Cars, Locations, Users).');

        // --- Seed Admin User ---
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('adminpassword', salt);
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin'
        });
        console.log('Admin user seeded!');

        // --- Seed Regular User ---
        const userPassword = await bcrypt.hash('userpassword', salt);
        const regularUser = await User.create({
            name: 'Test User',
            email: 'user@example.com',
            password: userPassword,
            role: 'customer'
        });
        console.log('Regular user seeded!');

        // --- Seed Locations ---
        const locations = await Location.insertMany([
            { name: 'Downtown Office', address: '123 Main St, Cityville', phoneNumber: '555-1111' },
            { name: 'Airport Branch', address: '456 Airport Rd, Cityville', phoneNumber: '555-2222' },
            { name: 'Suburb Hub', address: '789 Oak Ave, Townsville', phoneNumber: '555-3333' }
        ]);
        console.log('Locations seeded!');

        // --- Seed Cars ---
        const cars = await Car.insertMany([
            { brand: 'Mazda', model: 'MX5', year: 2023, licensePlate: 'MX5-001', category: 'Sport', dailyRate: 80, status: 'available', imageUrl: 'https://via.placeholder.com/300/09f/fff.png?text=Mazda+MX5', currentLocation: locations[0]._id },
            { brand: 'Lamborghini', model: 'Huracan', year: 2024, licensePlate: 'HUR-001', category: 'Luxury', dailyRate: 500, status: 'available', imageUrl: 'https://via.placeholder.com/300/f90/fff.png?text=Lamborghini+Huracan', currentLocation: locations[1]._id },
            { brand: 'BMW', model: 'M4', year: 2023, licensePlate: 'M4-001', category: 'Sport', dailyRate: 150, status: 'available', imageUrl: 'https://via.placeholder.com/300/90f/fff.png?text=BMW+M4', currentLocation: locations[0]._id },
            { brand: 'BMW', model: 'X5', year: 2024, licensePlate: 'X5-001', category: 'SUV', dailyRate: 130, status: 'available', imageUrl: 'https://via.placeholder.com/300/0ff/fff.png?text=BMW+X5', currentLocation: locations[2]._id },
            { brand: 'Audi', model: 'A5 Sportback', year: 2023, licensePlate: 'A5S-001', category: 'Sedan', dailyRate: 110, status: 'available', imageUrl: 'https://via.placeholder.com/300/f0f/fff.png?text=Audi+A5+Sportback', currentLocation: locations[1]._id },
            { brand: 'Ford', model: 'Ranger', year: 2022, licensePlate: 'RNG-001', category: 'Truck', dailyRate: 90, status: 'available', imageUrl: 'https://via.placeholder.com/300/ff0/fff.png?text=Ford+Ranger', currentLocation: locations[0]._id },
            { brand: 'Tesla', model: 'Model 3', year: 2024, licensePlate: 'TM3-001', category: 'Sedan', dailyRate: 140, status: 'available', imageUrl: 'https://via.placeholder.com/300/000/fff.png?text=Tesla+Model+3', currentLocation: locations[2]._id }
        ]);
        console.log('Cars seeded!');

        console.log('Database seeding complete!');
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();
