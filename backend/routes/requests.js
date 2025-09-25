const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const Request = require('../models/Request');
const Admin = require('../models/Admin');

// @route   POST /api/requests
// @desc    Sub-admin creates a new request for the main admin
// @access  Private (Sub-Admin only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const subAdmin = await Admin.findById(req.user.id);
        if (!subAdmin || subAdmin.role !== 'sub-admin') {
            return res.status(403).json({ msg: 'Forbidden' });
        }

        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ msg: 'Please provide title and description.' });
        }

        const newRequest = new Request({
            subAdmin: req.user.id,
            mainAdmin: subAdmin.createdBy, // Main admin jisne sub-admin banaya
            title,
            description
        });

        await newRequest.save();
        res.status(201).json(newRequest);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/requests/my-requests
// @desc    Sub-admin gets their own sent requests
// @access  Private (Sub-Admin only)
router.get('/my-requests', authMiddleware, async (req, res) => {
    try {
        const requests = await Request.find({ subAdmin: req.user.id }).sort({ date: -1 });
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/requests/all
// @desc    Main-admin gets all requests from their sub-admins
// @access  Private (Main-Admin only)
router.get('/all', authMiddleware, async (req, res) => {
    try {
        const mainAdmin = await Admin.findById(req.user.id);
        if (!mainAdmin || mainAdmin.role !== 'main-admin') {
            return res.status(403).json({ msg: 'Forbidden' });
        }
        
        // Populate subAdmin field to get their details like name and centerName
        const requests = await Request.find({ mainAdmin: req.user.id })
            .populate('subAdmin', ['name', 'centerName', 'email'])
            .sort({ date: -1 });

        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   PUT /api/requests/:id
// @desc    Main-admin updates a request status (Approve/Reject)
// @access  Private (Main-Admin only)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const mainAdmin = await Admin.findById(req.user.id);
        if (!mainAdmin || mainAdmin.role !== 'main-admin') {
            return res.status(403).json({ msg: 'Forbidden' });
        }

        const { status } = req.body;
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status.' });
        }

        let request = await Request.findById(req.params.id);
        if (!request || request.mainAdmin.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Request not found.' });
        }

        request.status = status;
        await request.save();
        
        // Populate subAdmin details for the response
        request = await request.populate('subAdmin', ['name', 'centerName', 'email']);
        
        res.json(request);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
