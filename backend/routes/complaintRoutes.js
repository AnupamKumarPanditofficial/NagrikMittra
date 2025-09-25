const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

// @route   POST /api/complaints
// @desc    Create a new complaint
router.post('/', async (req, res) => {
  try {
    const { userName, category, description, location } = req.body;
    const newComplaint = new Complaint({
      userName,
      category,
      description,
      location,
    });

    const complaint = await newComplaint.save();
    res.status(201).json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/complaints
// @desc    Get all complaints
router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ submittedAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;