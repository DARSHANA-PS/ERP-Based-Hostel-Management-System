const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  roomNumber: String,
  hostelName: String,
  category: {
    type: String,
    enum: ['water', 'electricity', 'cleanliness', 'wifi', 'maintenance', 'others'],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warden'
  },
  resolution: String,
  resolvedAt: Date,
  images: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);
