const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'maintenance', 'event', 'urgent', 'rules', 'fees'],
    default: 'general'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'wardens', 'specific-hostel'],
    default: 'all'
  },
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  attachments: [String],
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'creatorModel'
  },
  creatorModel: {
    type: String,
    enum: ['Admin', 'Warden']
  },
  expiryDate: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
