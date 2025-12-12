const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const wardenSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
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
  designation: {
    type: String,
    enum: ['chief-warden', 'assistant-warden', 'deputy-warden', 'night-warden'],
    required: true
  },
  assignedHostel: {
    type: String,
    enum: ['boys-hostel', 'girls-hostel'],
    required: true
  },
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel'
  },
  experience: Number,
  qualification: String,
  address: String,
  
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
  isActive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving
wardenSchema.pre('save', async function(next) {
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
wardenSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Warden', wardenSchema);
