const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false // Password is not required if signing in with Google
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple documents to have a null value for googleId
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    rentalHistory: [{
        type: Schema.Types.ObjectId,
        ref: 'Rental'
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
