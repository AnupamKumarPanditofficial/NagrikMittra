const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    // ... (purane fields jaise email, password, etc. waise hi rahenge)
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['main-admin', 'sub-admin'] },
    
    // --- UPDATED & NEW FIELDS ---
    name: { type: String, default: 'Sub-Admin User' }, // Welcome message ke liye
    profilePictureUrl: { type: String, default: '' }, // Profile picture ke liye URL
    centerName: { type: String, required: function () { return this.role === 'sub-admin'; } },
    // -------------------------

    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
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

module.exports = mongoose.model('admin', AdminSchema);
