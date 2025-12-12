const express = require('express');
const router = express.Router();
const { protect, adminOnly, wardenOnly } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const {
  createFeeStructure,
  getFeeStructures,
  updateFeeStructure,
  deleteFeeStructure,
  getStudentFees,
  createTransaction,
  verifyTransaction,
  sendReminder,
  getFeeStatistics,
  downloadReport
} = require('../controllers/fee.controller');

// Admin routes
router.post('/structure', protect, adminOnly, upload.single('qrCode'), createFeeStructure); // Added upload middleware for qrCode
router.get('/structures', protect, adminOnly, getFeeStructures);
router.put('/structure/:id', protect, adminOnly, updateFeeStructure);
router.delete('/structure/:id', protect, adminOnly, deleteFeeStructure);
router.get('/statistics', protect, adminOnly, getFeeStatistics);
router.get('/report/:type', protect, adminOnly, downloadReport);

// Warden routes
router.get('/hostel-fees/:hostelId', protect, wardenOnly, getStudentFees);
router.put('/verify/:transactionId', protect, wardenOnly, verifyTransaction);
router.post('/reminder', protect, sendReminder); // Both admin and warden can send

// Student routes
router.get('/my-fees', protect, getStudentFees);
router.post('/payment', protect, upload.single('paymentProof'), createTransaction);

module.exports = router;
