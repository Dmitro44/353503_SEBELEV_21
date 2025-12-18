const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MaintenanceRecordSchema = new Schema({
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        required: true
    }
});

const DamageRecordSchema = new Schema({
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        required: true
    },
    estimatedCost: {
        type: Number,
        default: 0
    }
});

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
    },
    maintenanceHistory: [MaintenanceRecordSchema],
    damageHistory: [DamageRecordSchema]
}, { timestamps: true });

module.exports = mongoose.model('Car', CarSchema);
