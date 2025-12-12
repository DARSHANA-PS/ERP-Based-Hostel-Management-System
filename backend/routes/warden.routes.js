const express = require('express');
const router = express.Router();
const { protect, wardenOnly } = require('../middleware/auth.middleware');
const Warden = require('../models/Warden');
const Student = require('../models/Student');
const Hostel = require('../models/Hostel');
const Complaint = require('../models/Complaint');

// Get warden profile - UPDATED
router.get('/profile', protect, wardenOnly, async (req, res) => {
  try {
    const warden = await Warden.findById(req.userId)
      .select('-password')
      .populate('hostelId', 'hostelName hostelType');
    
    if (!warden) {
      return res.status(404).json({
        success: false,
        message: 'Warden not found'
      });
    }
    
    console.log('Warden profile data:', {
      id: warden._id,
      name: warden.fullName,
      assignedHostel: warden.assignedHostel,
      hostelId: warden.hostelId
    });
    
    // If hostelId is not set, try to find and assign it
    if (!warden.hostelId && warden.assignedHostel) {
      console.log('Warden has no hostel ID, attempting to find and assign...');
      
      // Find hostel based on the warden's assigned hostel type
      const hostelType = warden.assignedHostel === 'boys-hostel' ? 'boys' : 'girls';
      const hostel = await Hostel.findOne({ hostelType: hostelType });
      
      if (hostel) {
        console.log('Found matching hostel:', hostel.hostelName);
        
        // Update warden with the hostel ID
        warden.hostelId = hostel._id;
        await warden.save();
        
        // Also update the hostel with the warden ID if not set
        if (!hostel.wardenId) {
          hostel.wardenId = warden._id;
          await hostel.save();
          console.log('Updated hostel with warden ID');
        }
        
        // Return updated warden data with populated hostel
        const updatedWarden = await Warden.findById(req.userId)
          .select('-password')
          .populate('hostelId', 'hostelName hostelType');
          
        return res.json({
          success: true,
          data: updatedWarden
        });
      } else {
        console.log('No hostel found for type:', hostelType);
      }
    }
    
    res.json({
      success: true,
      data: warden
    });
  } catch (error) {
    console.error('Error fetching warden profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// Get all students under warden's hostel
router.get('/students', protect, wardenOnly, async (req, res) => {
  try {
    const warden = await Warden.findById(req.userId).populate('hostelId');
    
    if (!warden) {
      return res.status(404).json({
        success: false,
        message: 'Warden not found'
      });
    }
    
    let students = [];
    
    if (warden.hostelId) {
      // Use the hostel ID to find students
      students = await Student.find({ 
        hostelName: warden.hostelId.hostelName,
        status: 'approved'
      }).select('-password').sort('-createdAt');
    } else {
      // Fallback to old method
      const hostelName = warden.assignedHostel === 'boys-hostel' ? 'Boys Hostel' : 'Girls Hostel';
      students = await Student.find({ 
        hostelName,
        status: 'approved'
      }).select('-password').sort('-createdAt');
    }
    
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

// Get complaints
router.get('/complaints', protect, wardenOnly, async (req, res) => {
  try {
    const warden = await Warden.findById(req.userId).populate('hostelId');
    
    if (!warden || !warden.hostelId) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const complaints = await Complaint.find({
      hostelName: warden.hostelId.hostelName
    }).populate('studentId', 'fullName studentId').sort('-createdAt');
    
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

module.exports = router;
