const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Roads', 'Water', 'Waste', 'Electricity'],
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;