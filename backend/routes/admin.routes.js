const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const Student = require('../models/Student');
const Warden = require('../models/Warden');
const Hostel = require('../models/Hostel');
const emailService = require('../utils/emailService');

// Get all students (not just pending)
router.get('/all-students', protect, adminOnly, async (req, res) => {
  try {
    const students = await Student.find()
      .select('-password')
      .sort('-createdAt');
    
    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students'
    });
  }
});

// Get all wardens (not just pending)
router.get('/all-wardens', protect, adminOnly, async (req, res) => {
  try {
    const wardens = await Warden.find()
      .select('-password')
      .populate('hostelId', 'hostelName hostelType')
      .sort('-createdAt');
    
    res.json({
      success: true,
      data: wardens
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching wardens'
    });
  }
});

// Get all pending registrations
router.get('/pending-registrations', protect, adminOnly, async (req, res) => {
  try {
    const pendingStudents = await Student.find({ status: 'pending' })
      .select('-password')
      .sort('-createdAt');
    
    const pendingWardens = await Warden.find({ status: 'pending' })
      .select('-password')
      .sort('-createdAt');
    
    res.json({
      success: true,
      data: {
        students: pendingStudents,
        wardens: pendingWardens
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending registrations'
    });
  }
});

// Approve student registration with email
router.put('/approve/student/:id', protect, adminOnly, async (req, res) => {
  try {
    console.log('🔵 Starting student approval process for ID:', req.params.id);
    
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      console.log('❌ Student not found with ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    console.log('✅ Found student:', {
      name: student.fullName,
      email: student.email,
      currentStatus: student.status
    });
    
    student.status = 'approved';
    student.isActive = true;
    await student.save();
    
    console.log('✅ Student status updated to approved in database');
    
    // Send approval email
    try {
      console.log('📧 Attempting to send approval email...');
      await emailService.sendApprovalEmail(student.email, student.fullName, 'student');
      console.log('✅ Approval email sent successfully to:', student.email);
      
      res.json({
        success: true,
        message: 'Student approved successfully and email sent',
        emailSent: true
      });
    } catch (emailError) {
      console.error('❌ Failed to send approval email:', emailError.message);
      console.error('Full email error:', emailError);
      
      // Still return success for approval, but indicate email failed
      res.json({
        success: true,
        message: 'Student approved successfully but email failed to send',
        emailSent: false,
        emailError: emailError.message
      });
    }
  } catch (error) {
    console.error('❌ Error in approval process:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving student',
      error: error.message
    });
  }
});

// Reject student registration with email
router.put('/reject/student/:id', protect, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    student.status = 'rejected';
    await student.save();
    
    // Send rejection email
    try {
      await emailService.sendRejectionEmail(student.email, student.fullName, 'student', reason);
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Student registration rejected and email sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting student'
    });
  }
});

// Approve warden registration with email - UPDATED
router.put('/approve/warden/:id', protect, adminOnly, async (req, res) => {
  try {
    const warden = await Warden.findById(req.params.id);
    
    if (!warden) {
      return res.status(404).json({
        success: false,
        message: 'Warden not found'
      });
    }
    
    // Find the appropriate hostel based on warden's assignedHostel
    const hostelType = warden.assignedHostel === 'boys-hostel' ? 'boys' : 'girls';
    const hostel = await Hostel.findOne({ hostelType: hostelType });
    
    if (hostel) {
      console.log('Found hostel for warden:', hostel.hostelName);
      
      // Update the hostel with this warden
      hostel.wardenId = warden._id;
      await hostel.save();
      
      // Update the warden with the hostel ID
      warden.hostelId = hostel._id;
      console.log('Assigned hostel ID to warden:', hostel._id);
    } else {
      console.log('No hostel found for type:', hostelType);
    }
    
    warden.status = 'approved';
    warden.isActive = true;
    await warden.save();
    
    // Send approval email
    try {
      await emailService.sendApprovalEmail(warden.email, warden.fullName, 'warden');
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Warden approved successfully and email sent',
      data: warden
    });
  } catch (error) {
    console.error('Error approving warden:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving warden',
      error: error.message
    });
  }
});

// Reject warden registration with email
router.put('/reject/warden/:id', protect, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const warden = await Warden.findById(req.params.id);
    
    if (!warden) {
      return res.status(404).json({
        success: false,
        message: 'Warden not found'
      });
    }
    
    warden.status = 'rejected';
    await warden.save();
    
    // Send rejection email
    try {
      await emailService.sendRejectionEmail(warden.email, warden.fullName, 'warden', reason);
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Warden registration rejected and email sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting warden'
    });
  }
});

// Delete student
router.delete('/student/:id', protect, adminOnly, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Send deletion email if student was approved or pending
    if (student.status === 'approved' || student.status === 'pending') {
      try {
        await emailService.sendRejectionEmail(
          student.email, 
          student.fullName, 
          'student', 
          'Your registration has been removed from our system. Please contact the administration for more information.'
        );
      } catch (emailError) {
        console.error('Failed to send deletion email:', emailError);
      }
    }
    
    await Student.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting student'
    });
  }
});
// Temporary route to fix wardens without hostel IDs
router.post('/fix-warden-hostels', protect, adminOnly, async (req, res) => {
  try {
    const wardens = await Warden.find({ 
      status: 'approved',
      hostelId: null 
    });
    
    let fixed = 0;
    
    for (const warden of wardens) {
      const hostelType = warden.assignedHostel === 'boys-hostel' ? 'boys' : 'girls';
      const hostel = await Hostel.findOne({ hostelType: hostelType });
      
      if (hostel) {
        warden.hostelId = hostel._id;
        await warden.save();
        
        if (!hostel.wardenId) {
          hostel.wardenId = warden._id;
          await hostel.save();
        }
        
        fixed++;
      }
    }
    
    res.json({
      success: true,
      message: `Fixed ${fixed} wardens`,
      totalWardens: wardens.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fixing wardens',
      error: error.message
    });
  }
});

// Dashboard statistics
router.get('/dashboard-stats', protect, adminOnly, async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ status: 'approved' });
    const totalWardens = await Warden.countDocuments({ status: 'approved' });
    const pendingStudents = await Student.countDocuments({ status: 'pending' });
    const pendingWardens = await Warden.countDocuments({ status: 'pending' });
    
    res.json({
      success: true,
      data: {
        totalStudents,
        totalWardens,
        pendingStudents,
        pendingWardens,
        totalHostels: 2,
        totalRooms: 400,
        pendingFees: 210000,
        pendingComplaints: 5
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats'
    });
  }
});

module.exports = router;
