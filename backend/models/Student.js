const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  // Personal Details
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  aadharNumber: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  photo: {
    type: String // URL to photo
  },
  
  // Contact Details
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  mobile: {
    type: String,
    required: true
  },
  parentName: {
    type: String,
    required: true
  },
  parentMobile: {
    type: String,
    required: true
  },
  permanentAddress: {
    type: String,
    required: true
  },
  emergencyContact: {
    type: String,
    required: true
  },
  
  // Hostel Preference
  hostelName: {
    type: String,
    required: true
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'triple', 'pending'],
    required: true,
    default: 'pending'
  },
  messPreference: {
    type: String,
    enum: ['veg', 'non-veg', 'pending'],
    required: true,
    default: 'pending'
  },
  
  // Authentication
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Registration Completion Status
  isFullyRegistered: {
    type: Boolean,
    default: false
  },
  
  // Room Details (filled after approval)
  roomNumber: String,
  bedNumber: String,
  
  isActive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
studentSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if student can login
studentSchema.methods.canLogin = function() {
  return this.status === 'approved' && this.isFullyRegistered;
};

module.exports = mongoose.model('Student', studentSchema);
