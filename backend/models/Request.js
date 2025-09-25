const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RequestSchema = new Schema({
    subAdmin: {
        type: Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    mainAdmin: {
        type: Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('request', RequestSchema);
