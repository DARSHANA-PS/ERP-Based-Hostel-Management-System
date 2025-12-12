const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  roomNo: {
    type: String,
    required: true
  },
  floorNo: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  occupied: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Available', 'Full', 'Maintenance'],
    default: 'Available'
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  amenities: {
    type: [String],
    default: []
  },
  lastMaintenanceDate: {
    type: Date
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index for unique room number per hostel
roomSchema.index({ hostelId: 1, roomNo: 1 }, { unique: true });

// Update status based on occupancy
roomSchema.pre('save', function(next) {
  if (this.occupied >= this.capacity) {
    this.status = 'Full';
  } else if (this.status === 'Full' && this.occupied < this.capacity) {
    this.status = 'Available';
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema);
