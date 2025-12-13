const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CarSchema = new Schema({
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    licensePlate: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        enum: ['Sedan', 'SUV', 'Truck', 'Van', 'Luxury', 'Sport'],
        required: true
    },
    dailyRate: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'rented', 'maintenance'],
        default: 'available'
    },
    imageUrl: {
        type: String
    },
    currentLocation: {
        type: Schema.Types.ObjectId,
        ref: 'Location'
    }
}, { timestamps: true });

module.exports = mongoose.model('Car', CarSchema);
