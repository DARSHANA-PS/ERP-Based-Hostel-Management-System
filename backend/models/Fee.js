const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  roomType: {
    type: String,
    required: true,
    enum: ['single', 'double', 'triple', 'dormitory']
  },
  amount: {
    type: Number,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  paymentDetails: {
    upiId: String,
    qrCode: String, // URL to QR code image
    bankDetails: {
      accountName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);

const studentFeeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  feeStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeStructure',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  pendingAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

const StudentFee = mongoose.model('StudentFee', studentFeeSchema);

const transactionSchema = new mongoose.Schema({
  studentFee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentFee',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'bank_transfer', 'cash', 'card'],
    required: true
  },
  paymentProof: {
    type: String // URL to uploaded screenshot/receipt
  },
  status: {
    type: String,
    enum: ['pending_verification', 'verified', 'rejected'],
    default: 'pending_verification'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warden'
  },
  verificationDate: Date,
  remarks: String
}, {
  timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);

const reminderSchema = new mongoose.Schema({
  studentFee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentFee'
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  sentBy: {
    type: String,
    required: true
  },
  sentByRole: {
    type: String,
    enum: ['admin', 'warden', 'system'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'in_app'],
    default: 'in_app'
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  }
}, {
  timestamps: true
});

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = {
  FeeStructure,
  StudentFee,
  Transaction,
  Reminder
};
