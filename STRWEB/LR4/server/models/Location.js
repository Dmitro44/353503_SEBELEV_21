const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String
    },
    operatingHours: {
        type: String,
        default: '9:00 AM - 6:00 PM'
    }
}, { timestamps: true });

module.exports = mongoose.model('Location', LocationSchema);
