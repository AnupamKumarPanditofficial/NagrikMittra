const express = require('express');
const router = express.Router();
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('../config/firebaseAdmin');
const authMiddleware = require('../middleware/authMiddleware'); // Import middleware

// Import BOTH models
const User = require('../models/User');
const Admin = require('../models/Admin');

const { sendEmailOtp, sendSmsOtp } = require('../utils/notificationService');

const isEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

// Helper function to find any account (user or admin)
const findAccount = async (query) => {
    let account = await Admin.findOne(query);
    if (account) return { account, type: 'admin' };
    
    account = await User.findOne(query);
    if (account) return { account, type: 'user' };

    return { account: null, type: null };
};

// @route   GET /api/auth/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        let account = await User.findById(req.user.id).select('-password');
        if (!account) {
            account = await Admin.findById(req.user.id).select('-password');
        }

        if (!account) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // UPDATED: Ab yeh name aur profilePictureUrl bhi bhejega
        const userProfile = {
            name: account.name,
            contactInfo: account.email || account.phone,
            role: account.role,
            profilePictureUrl: account.profilePictureUrl || '' // Yeh line jodi gayi hai
        };

        res.json(userProfile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   PUT /api/auth/profile
// @desc    Update user's profile
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { name, email, address } = req.body;

        let account = await User.findById(req.user.id);
        if (!account) {
            account = await Admin.findById(req.user.id);
        }

        if (!account) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (name) account.name = name;
        if (address) account.address = address;
        
        if (email && email !== account.email) {
            const existing = await findAccount({ email });
            if (existing.account && existing.account.id.toString() !== req.user.id) {
                return res.status(400).json({ msg: 'Email is already in use.' });
            }
            account.email = email;
        }

        await account.save();

        const userProfile = {
            name: account.name,
            contactInfo: account.email || account.phone,
            role: account.role,
            address: account.address,
        };

        res.json(userProfile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   POST /api/auth/register
// @desc    Register a new CITIZEN
router.post('/register', async (req, res) => {
    try {
        const { name, contactInfo, password, recaptchaToken } = req.body;
        // ... (reCAPTCHA verification logic) ...
        const query = isEmail(contactInfo) ? { email: contactInfo } : { phone: contactInfo };
        const { account: existingAccount } = await findAccount(query);
        if (existingAccount) {
            return res.status(400).json({ msg: 'This contact info is already in use.' });
        }
        
        const firebaseUserPayload = { displayName: name, password };
        if (isEmail(contactInfo)) { firebaseUserPayload.email = contactInfo; } 
        else { firebaseUserPayload.phoneNumber = contactInfo; }
        const userRecord = await admin.auth().createUser(firebaseUserPayload);

        let newUser = new User({
            name,
            password,
            firebaseUid: userRecord.uid,
            role: 'citizen' // Explicitly set role
        });
        if (isEmail(contactInfo)) { newUser.email = contactInfo; } 
        else { newUser.phone = contactInfo; }

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        newUser.otp = otp;
        newUser.otpExpires = Date.now() + 10 * 60 * 1000;
        
        if (isEmail(contactInfo)) { await sendEmailOtp(newUser.email, otp); } 
        else { await sendSmsOtp(newUser.phone, otp); }

        await newUser.save();
        res.status(201).json({ msg: 'Registration successful! An OTP has been sent.' });
    } catch (err) {
        // ... (error handling)
    }
});

// @route   POST /api/auth/register-admin
// @desc    Register a new MAIN-ADMIN
router.post('/register-admin', async (req, res) => {
    try {
        const { name, contactInfo, password, recaptchaToken } = req.body;

        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
        const recaptchaResponse = await axios.post(verificationURL);
        if (!recaptchaResponse.data.success) {
            return res.status(400).json({ msg: 'reCAPTCHA verification failed.' });
        }

        const query = { email: contactInfo };
        const { account: existingAccount } = await findAccount(query);
        if (existingAccount) {
            return res.status(400).json({ msg: 'This contact info is already in use.' });
        }
        
        const firebaseUserPayload = {
            displayName: name,
            password: password,
            email: contactInfo
        };
        const userRecord = await admin.auth().createUser(firebaseUserPayload);

        let newAdmin = new Admin({
            name,
            email: contactInfo,
            password,
            firebaseUid: userRecord.uid,
            role: 'main-admin'
        });

        const salt = await bcrypt.genSalt(10);
        newAdmin.password = await bcrypt.hash(password, salt);
        
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        newAdmin.otp = otp;
        newAdmin.otpExpires = Date.now() + 10 * 60 * 1000;
        
        await sendEmailOtp(newAdmin.email, otp);

        await newAdmin.save();
        
        res.status(201).json({ msg: 'Admin registration successful! An OTP has been sent.' });

    } catch (err) {
        console.error("Admin Registration Error:", err);
        if (err.code && err.code.startsWith('auth/')) {
            return res.status(400).json({ msg: 'An account with this email already exists in Firebase.' });
        }
        res.status(500).send('Server Error');
    }
});


// @route   POST /api/auth/login
// @desc    Authenticate ANY user/admin & get token
router.post('/login', async (req, res) => {
    try {
        const { contactInfo, password, recaptchaToken } = req.body;
        // ... (reCAPTCHA verification logic) ...
        const query = isEmail(contactInfo) ? { email: contactInfo } : { phone: contactInfo };
        const { account } = await findAccount(query);
        
        if (!account) return res.status(400).json({ msg: 'Invalid credentials.' });
        if (!account.isVerified) return res.status(400).json({ msg: 'Please verify your account first.' });
        
        if (account.status === 'Inactive') {
            return res.status(403).json({ msg: 'Your account is deactivated. Please contact the main admin.' });
        }

        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials.' });

        const payload = { user: { id: account.id, role: account.role || 'citizen' } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, role: payload.user.role });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for ANY user/admin
router.post('/verify-otp', async (req, res) => {
    try {
        const { contactInfo, otp } = req.body;
        const query = isEmail(contactInfo) ? { email: contactInfo } : { phone: contactInfo };
        const { account } = await findAccount(query);

        if (!account || account.otp !== otp || account.otpExpires < Date.now()) {
            return res.status(400).json({ msg: 'Invalid or expired OTP.' });
        }

        account.isVerified = true;
        account.otp = undefined;
        account.otpExpires = undefined;
        await account.save();

        const payload = { user: { id: account.id, role: account.role || 'citizen' } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, role: payload.user.role });
        });
    } catch (err) {
        // ... (error handling)
    }
});


router.post('/resend-otp', async (req, res) => {
    try {
        const { contactInfo } = req.body;
        const query = isEmail(contactInfo) ? { email: contactInfo } : { phone: contactInfo };
        const { account } = await findAccount(query);

        if (!account || account.isVerified) {
            return res.status(200).json({ msg: 'If a non-verified account exists, a new OTP has been sent.' });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        account.otp = otp;
        account.otpExpires = Date.now() + 10 * 60 * 1000;
        await account.save();
        
        if (account.email) {
            await sendEmailOtp(account.email, otp);
        } else if (account.phone) {
            await sendSmsOtp(account.phone, otp);
        }
        
        res.json({ msg: 'A new OTP has been sent.' });

    } catch (err) {
        console.error("Resend OTP Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset OTP
router.post('/forgot-password', async (req, res) => {
    try {
        const { contactInfo } = req.body;
        const query = isEmail(contactInfo) ? { email: contactInfo } : { phone: contactInfo };
        const { account } = await findAccount(query);

        if (account) {
            const otp = Math.floor(1000 + Math.random() * 9000).toString();
            account.otp = otp;
            account.otpExpires = Date.now() + 10 * 60 * 1000;
            await account.save();

            if (account.email) {
                await sendEmailOtp(account.email, otp);
            } else if (account.phone) {
                await sendSmsOtp(account.phone, otp);
            }
        }
        
        res.json({ msg: "If an account with that contact info exists, a password reset code has been sent." });

    } catch (err) {
        console.error("Forgot Password Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset user's password using OTP
router.post('/reset-password', async (req, res) => {
    try {
        const { contactInfo, otp, newPassword } = req.body;

        if (newPassword.length < 6) {
            return res.status(400).json({ msg: "Password must be at least 6 characters long." });
        }

        const query = isEmail(contactInfo) ? { email: contactInfo } : { phone: contactInfo };
        const { account } = await findAccount(query);

        if (!account || account.otp !== otp || account.otpExpires < Date.now()) {
            return res.status(400).json({ msg: 'Invalid or expired OTP.' });
        }

        const salt = await bcrypt.genSalt(10);
        account.password = await bcrypt.hash(newPassword, salt);
        
        account.otp = undefined;
        account.otpExpires = undefined;
        await account.save();

        res.json({ msg: "Password has been reset successfully. Please log in." });

    } catch (err) {
        console.error("Reset Password Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// ===============================================
// ===== SUB-ADMIN MANAGEMENT ROUTES =====
// ===============================================

// @route   POST /api/auth/create-sub-admin
// @desc    Main admin creates a sub-admin
// @access  Private (Main Admin only)
router.post('/create-sub-admin', authMiddleware, async (req, res) => {
    try {
        const mainAdmin = await Admin.findById(req.user.id);
        if (!mainAdmin || mainAdmin.role !== 'main-admin') {
            return res.status(403).json({ msg: 'Forbidden: Access is denied.' });
        }

        const { email, password, centerName } = req.body;

        if (!email || !password || !centerName) {
            return res.status(400).json({ msg: 'Please provide email, password, and center name.' });
        }

        const { account: existingAccount } = await findAccount({ email });
        if (existingAccount) {
            return res.status(400).json({ msg: 'An account with this email already exists.' });
        }

        let newSubAdmin = new Admin({
            email,
            password,
            centerName,
            role: 'sub-admin',
            isVerified: true, 
            status: 'Active',
            createdBy: req.user.id
        });

        const salt = await bcrypt.genSalt(10);
        newSubAdmin.password = await bcrypt.hash(password, salt);

        await newSubAdmin.save();
        
        const subAdminResponse = { ...newSubAdmin.toObject() };
        delete subAdminResponse.password;

        res.status(201).json({ msg: 'Sub-admin created successfully.', subAdmin: subAdminResponse });

    } catch (err) {
        console.error("Create Sub-Admin Error:", err);
        res.status(500).send('Server Error');
    }
});


// @route   GET /api/auth/sub-admins
// @desc    Get all sub-admins created by the main admin
// @access  Private (Main Admin only)
router.get('/sub-admins', authMiddleware, async (req, res) => {
    try {
        const mainAdmin = await Admin.findById(req.user.id);
        if (!mainAdmin || mainAdmin.role !== 'main-admin') {
            return res.status(403).json({ msg: 'Forbidden: Access is denied.' });
        }

        const subAdmins = await Admin.find({ createdBy: req.user.id }).select('-password');
        
        res.json(subAdmins);

    } catch (err) {
        console.error("Get Sub-Admins Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/auth/sub-admin-status/:id
// @desc    Update a sub-admin's status (Activate/Deactivate)
// @access  Private (Main Admin only)
router.put('/sub-admin-status/:id', authMiddleware, async (req, res) => {
    try {
        const mainAdmin = await Admin.findById(req.user.id);
        if (!mainAdmin || mainAdmin.role !== 'main-admin') {
            return res.status(403).json({ msg: 'Forbidden: Access is denied.' });
        }

        const { status } = req.body;
        if (!['Active', 'Inactive'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status provided.' });
        }

        const subAdmin = await Admin.findOne({ _id: req.params.id, createdBy: req.user.id });

        if (!subAdmin) {
            return res.status(404).json({ msg: 'Sub-admin not found or you do not have permission to modify it.' });
        }

        subAdmin.status = status;
        await subAdmin.save();

        const subAdminResponse = { ...subAdmin.toObject() };
        delete subAdminResponse.password;

        res.json({ msg: `Sub-admin status updated to ${status}.`, subAdmin: subAdminResponse });

    } catch (err) {
        console.error("Update Sub-Admin Status Error:", err);
        res.status(500).send('Server Error');
    }
});

// NEW ROUTE FOR PROFILE UPDATE
// @route   PUT /api/auth/update-subadmin-profile
// @desc    Sub-admin updates their own profile
// @access  Private
router.put('/update-subadmin-profile', authMiddleware, async (req, res) => {
    try {
        const account = await Admin.findById(req.user.id);
        if (!account || (account.role !== 'sub-admin' && account.role !== 'main-admin')) {
            return res.status(403).json({ msg: 'Forbidden: Access is denied.' });
        }

        const { name, profilePictureUrl } = req.body;

        if (name) account.name = name;
        if (typeof profilePictureUrl !== 'undefined') {
            account.profilePictureUrl = profilePictureUrl;
        }

        await account.save();
        
        const updatedProfile = { ...account.toObject() };
        delete updatedProfile.password;
        delete updatedProfile.otp;
        
        res.json({ msg: 'Profile updated successfully.', profile: updatedProfile });

    } catch (err) {
        console.error("Update Profile Error:", err);
        res.status(500).send('Server Error');
    }
});


module.exports = router;

