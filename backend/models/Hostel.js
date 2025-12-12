const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  hostelName: {
    type: String,
    required: true,
    trim: true
  },
  hostelCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  hostelType: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  wardenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warden',
    required: true
  },
  totalFloors: {
    type: Number,
    required: true,
    min: 1
  },
  totalRooms: {
    type: Number,
    required: true,
    min: 1
  },
  studentsPerRoom: {
    type: Number,
    enum: [1, 2, 3, 4],
    required: true
  },
  hostelCapacity: {
    type: Number,
    default: function() {
      return this.totalRooms * this.studentsPerRoom;
    }
  },
  // Add this new field
  perStudentAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  location: {
    type: String,
    required: true
  },
  facilities: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true
  },
  hostelImage: {
    type: String
  },
  hostelVideo: {
    type: String
  },
  availableRooms: {
    type: Number,
    default: function() {
      return this.totalRooms;
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Under Maintenance'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Update hostel capacity when rooms or students per room changes
hostelSchema.pre('save', function(next) {
  this.hostelCapacity = this.totalRooms * this.studentsPerRoom;
  next();
});

module.exports = mongoose.model('Hostel', hostelSchema);
