const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false, 
        unique: true,
        sparse: true 
    },
    phone: {
        type: String,
        required: false, 
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: true
    },
    // ===== NEW FIELD ADDED HERE =====
    role: {
        type: String,
        required: true,
        default: 'citizen'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// This ensures that a user must provide either an email or a phone number
UserSchema.pre('save', function(next) {
    if (!this.email && !this.phone) {
        next(new Error('Either an email or a phone number must be provided.'));
    } else {
        next();
    }
});

module.exports = mongoose.model('user', UserSchema);