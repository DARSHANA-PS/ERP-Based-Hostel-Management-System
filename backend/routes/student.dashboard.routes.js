const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Student = require('../models/Student');
const Complaint = require('../models/Complaint');
const Fee = require('../models/Fee');
const Announcement = require('../models/Announcement');

// Get dashboard statistics
router.get('/dashboard/stats', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.userId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Get complaints count
    const activeComplaints = await Complaint.countDocuments({
      studentId: req.userId,
      status: { $in: ['pending', 'in-progress'] }
    });
    
    const resolvedComplaints = await Complaint.countDocuments({
      studentId: req.userId,
      status: 'resolved'
    });
    
    // Get fee details
    const pendingFees = await Fee.aggregate([
      { $match: { studentId: student._id, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get unread announcements
    const Hostel = require('../models/Hostel');
    const hostel = await Hostel.findOne({ hostelName: student.hostelName });
    
    let unreadAnnouncements = 0;
    if (hostel) {
      unreadAnnouncements = await Announcement.countDocuments({
        $or: [
          { targetAudience: 'all' },
          { 
            targetAudience: 'specific-hostel',
            hostelId: hostel._id 
          }
        ],
        isActive: true,
        readBy: { $ne: req.userId }
      });
    }
    
    res.json({
      success: true,
      data: {
        activeComplaints,
        resolvedComplaints,
        pendingFees: pendingFees[0]?.total || 0,
        unreadAnnouncements,
        roomDetails: {
          roomNumber: student.roomNumber || 'Not Assigned',
          bedNumber: student.bedNumber || 'Not Assigned',
          hostelName: student.hostelName
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
});

// Get fee details
router.get('/fees', protect, async (req, res) => {
  try {
    const fees = await Fee.find({ studentId: req.userId })
      .sort('-createdAt');
    
    const totalPaid = fees
      .filter(f => f.status === 'paid')
      .reduce((sum, f) => sum + f.amount, 0);
    
    const totalPending = fees
      .filter(f => f.status === 'pending')
      .reduce((sum, f) => sum + f.amount, 0);
    
    res.json({
      success: true,
      data: {
        fees,
        totalPaid,
        totalPending,
        totalAmount: totalPaid + totalPending
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fee details'
    });
  }
});

// Get fee history
router.get('/fees/history', protect, async (req, res) => {
  try {
    const fees = await Fee.find({ 
      studentId: req.userId,
      status: 'paid'
    }).sort('-paymentDate');
    
    res.json({
      success: true,
      data: fees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fee history'
    });
  }
});

// Get announcements
router.get('/announcements', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.userId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Find the hostel ID based on student's hostel name
    const Hostel = require('../models/Hostel');
    const hostel = await Hostel.findOne({ hostelName: student.hostelName });
    
    if (!hostel) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    // Get announcements for this specific hostel
    const announcements = await Announcement.find({
      $or: [
        { targetAudience: 'all' },
        { 
          targetAudience: 'specific-hostel',
          hostelId: hostel._id 
        }
      ],
      isActive: true
    })
    .populate('createdBy', 'fullName')
    .sort('-createdAt');
    
    res.json({
      success: true,
      data: announcements
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements'
    });
  }
});

// Mark announcement as read
router.put('/announcements/:id/read', protect, async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.userId } }
    );
    
    res.json({
      success: true,
      message: 'Announcement marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking announcement as read'
    });
  }
});

// Get complaints
router.get('/complaints', protect, async (req, res) => {
  try {
    const complaints = await Complaint.find({ studentId: req.userId })
      .sort('-createdAt');
    
    res.json({
      success: true,
      data: complaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints'
    });
  }
});

// Create new complaint
router.post('/complaints', protect, async (req, res) => {
  try {
    const { category, description, priority } = req.body;
    const student = await Student.findById(req.userId);
    
    const complaint = new Complaint({
      studentId: req.userId,
      studentName: student.fullName,
      roomNumber: student.roomNumber,
      hostelName: student.hostelName,
      category,
      description,
      priority: priority || 'medium',
      status: 'pending'
    });
    
    await complaint.save();
    
    res.status(201).json({
      success: true,
      message: 'Complaint raised successfully',
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating complaint'
    });
  }
});

// Get complaint details
router.get('/complaints/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      studentId: req.userId
    });
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint details'
    });
  }
});

// Get hostel details
router.get('/hostel/details', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.userId);
    const Hostel = require('../models/Hostel');
    
    if (!student.hostelName) {
      return res.status(404).json({
        success: false,
        message: 'No hostel assigned'
      });
    }
    
    const hostel = await Hostel.findOne({ hostelName: student.hostelName })
      .populate('wardenId', 'fullName email mobile designation');
    
    res.json({
      success: true,
      data: hostel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching hostel details'
    });
  }
});

// Send contact message
router.post('/contact/message', protect, async (req, res) => {
  try {
    const { subject, message } = req.body;
    const student = await Student.findById(req.userId);
    
    // Here you would implement actual message sending logic
    // For now, we'll just return success
    
    res.json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
});

// Upload profile photo
router.post('/profile/photo', protect, async (req, res) => {
  // Implement file upload logic here
  res.json({
    success: true,
    message: 'Photo uploaded successfully'
  });
});

module.exports = router;
