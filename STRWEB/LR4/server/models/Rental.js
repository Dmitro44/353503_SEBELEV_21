const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RentalSchema = new Schema({
    car: {
        type: Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rentalDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date,
        required: true
    },
    actualReturnDate: {
        type: Date
    },
    totalCost: {
        type: Number,
        required: true
    },
    returnComments: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending_approval', 'active', 'completed', 'cancelled', 'rejected'],
        default: 'pending_approval'
    }
}, { timestamps: true });

module.exports = mongoose.model('Rental', RentalSchema);
