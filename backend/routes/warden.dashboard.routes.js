const express = require('express');
const router = express.Router();
const { protect, wardenOnly } = require('../middleware/auth.middleware');
const Warden = require('../models/Warden');
const Hostel = require('../models/Hostel');
const Student = require('../models/Student');
const Room = require('../models/Room');
const Complaint = require('../models/Complaint');
const Announcement = require('../models/Announcement');
const { StudentFee } = require('../models/Fee');
const Notification = require('../models/Notification');

// Helper function to create notifications
const createNotification = async (userId, userType, type, title, message, relatedId = null, relatedModel = null) => {
  try {
    const notification = new Notification({
      userId,
      userType,
      type,
      title,
      message,
      relatedId,
      relatedModel
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Get warden profile
router.get('/profile', protect, wardenOnly, async (req, res) => {
  try {
    const warden = await Warden.findById(req.userId)
      .select('-password')
      .populate('hostelId');
    
    if (!warden) {
      return res.status(404).json({
        success: false,
        message: 'Warden not found'
      });
    }

    // If no hostelId but has assigned hostel, find and update
    if (!warden.hostelId && warden.assignedHostel) {
      const hostel = await Hostel.findOne({ 
        wardenId: req.userId 
      });
      
      if (hostel) {
        warden.hostelId = hostel._id;
        await warden.save();
      }
    }

    res.status(200).json({
      success: true,
      data: warden
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get warden dashboard stats
router.get('/dashboard-stats', protect, wardenOnly, async (req, res) => {
  try {
    const warden = await Warden.findById(req.userId);
    if (!warden) {
      return res.status(404).json({ success: false, message: 'Warden not found' });
    }

    // Get assigned hostel
    const hostel = await Hostel.findOne({ wardenId: req.userId });
    if (!hostel) {
      return res.json({
        success: true,
        data: {
          hostelName: 'Not Assigned',
          totalRooms: 0,
          studentsStaying: 0,
          activeComplaints: 0,
          totalFeesCollected: 0,
          pendingRequests: 0,
          availableRooms: 0,
          occupiedBeds: 0,
          totalBeds: 0
        }
      });
    }

    // Get room statistics
    const rooms = await Room.find({ hostelId: hostel._id });
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter(r => r.status === 'Available' && r.occupied < r.capacity).length;
    const occupiedBeds = rooms.reduce((sum, room) => sum + room.occupied, 0);
    const totalBeds = hostel.hostelCapacity;

    // Get students count
    const students = await Student.find({
      hostelName: hostel.hostelName,
      status: 'approved'
    });

    // Get pending student requests
    const pendingRequests = await Student.countDocuments({
      hostelName: hostel.hostelName,
      status: 'pending'
    });

    // Get active complaints count
    const activeComplaints = await Complaint.countDocuments({
      hostelName: hostel.hostelName,
      status: { $in: ['pending', 'in-progress'] }
    });

    // Calculate total fees collected
    const feeStats = await StudentFee.aggregate([
      {
        $match: {
          hostel: hostel._id
        }
      },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: '$paidAmount' },
          totalExpected: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalFeesCollected = feeStats[0]?.totalCollected || 0;

    res.json({
      success: true,
      data: {
        hostelName: hostel.hostelName,
        hostelType: hostel.hostelType,
        totalRooms,
        studentsStaying: students.length,
        activeComplaints,
        totalFeesCollected,
        pendingRequests,
        availableRooms,
        occupiedBeds,
        totalBeds,
        occupancyRate: totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0,
        roomStats: {
          available: rooms.filter(r => r.status === 'Available').length,
          full: rooms.filter(r => r.status === 'Full').length,
          maintenance: rooms.filter(r => r.status === 'Maintenance').length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching warden dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard stats' });
  }
});

// Get pending student requests
router.get('/pending-students', protect, wardenOnly, async (req, res) => {
  try {
    const hostel = await Hostel.findOne({ wardenId: req.userId });
    if (!hostel) {
      return res.json({ success: true, data: [] });
    }

    const pendingStudents = await Student.find({
      hostelName: hostel.hostelName,
      status: 'pending'
    }).select('-password').sort('-createdAt');

    res.json({
      success: true,
      data: pendingStudents
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching pending students' });
  }
});

// Get all students in warden's hostel
router.get('/hostel-students', protect, wardenOnly, async (req, res) => {
  try {
    const { status = 'approved', search = '', page = 1, limit = 10 } = req.query;
    const hostel = await Hostel.findOne({ wardenId: req.userId });
    
    if (!hostel) {
      return res.json({ success: true, data: [], total: 0 });
    }

    const query = {
      hostelName: hostel.hostelName,
      status: status
    };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .select('-password')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      success: true,
      data: students,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching students' });
  }
});

// Get rooms in warden's hostel
router.get('/hostel-rooms', protect, wardenOnly, async (req, res) => {
  try {
    const { floor, status } = req.query;
    const hostel = await Hostel.findOne({ wardenId: req.userId });
    
    if (!hostel) {
      return res.json({ success: true, data: [] });
    }

    const query = { hostelId: hostel._id };
    if (floor) query.floorNo = floor;
    if (status) query.status = status;

    const rooms = await Room.find(query)
      .populate('students', 'fullName studentId mobile email')
      .sort({ roomNo: 1 });

    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching rooms' });
  }
});

// Approve/Reject student
router.put('/student-request/:id', protect, wardenOnly, async (req, res) => {
  try {
    const { action, reason } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (action === 'approve') {
      student.status = 'approved';
      student.isActive = true;
      
      // Create notification for student
      await createNotification(
        student._id,
        'Student',
        'general',
        'Registration Approved',
        'Your hostel registration has been approved by the warden.'
      );
    } else {
      student.status = 'rejected';
      
      // Create notification for student
      await createNotification(
        student._id,
        'Student',
        'general',
        'Registration Rejected',
        `Your hostel registration has been rejected. ${reason ? `Reason: ${reason}` : ''}`
      );
    }

    await student.save();

    res.json({
      success: true,
      message: `Student ${action}ed successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing request' });
  }
});

// Get fee statistics - Updated to use actual fee data
router.get('/fee-stats', protect, wardenOnly, async (req, res) => {
  try {
    const hostel = await Hostel.findOne({ wardenId: req.userId });
    if (!hostel) {
      return res.json({
        success: true,
        data: { totalCollected: 0, pending: 0, students: [] }
      });
    }

    // Get actual fee data
    const feeData = await StudentFee.find({ hostel: hostel._id })
      .populate('student', 'fullName studentId email mobile roomNumber')
      .sort('-createdAt');

    const totalCollected = feeData.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
    const pendingAmount = feeData.reduce((sum, f) => sum + (f.pendingAmount || 0), 0);

    res.json({
      success: true,
      data: {
        totalCollected,
        pending: pendingAmount,
        feeRecords: feeData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching fee stats' });
  }
});

// Create announcement
router.post('/announcements', protect, wardenOnly, async (req, res) => {
  try {
    const { title, description } = req.body;
    const warden = await Warden.findById(req.userId);
    
    if (!warden) {
      return res.status(404).json({ success: false, message: 'Warden not found' });
    }
    
    // Get warden's assigned hostel
    const hostel = await Hostel.findOne({ wardenId: req.userId });
    
    if (!hostel) {
      return res.status(400).json({ success: false, message: 'No hostel assigned to this warden' });
    }

    // Create announcement
    const announcement = new Announcement({
      title,
      content: description,
      category: 'general',
      targetAudience: 'specific-hostel',
      hostelId: hostel._id,
      priority: 'medium',
      createdBy: req.userId,
      creatorModel: 'Warden',
      isActive: true
    });

    await announcement.save();

    // Create notifications for all students in this hostel
    const students = await Student.find({
      hostelName: hostel.hostelName,
      status: 'approved'
    });

    const notificationPromises = students.map(student => 
      createNotification(
        student._id,
        'Student',
        'announcement',
        'New Announcement',
        `${title} - ${description.substring(0, 100)}...`,
        announcement._id,
        'Announcement'
      )
    );

    await Promise.all(notificationPromises);

    res.json({
      success: true,
      message: 'Announcement posted successfully',
      data: announcement
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, message: 'Error posting announcement' });
  }
});

// Get announcements created by this warden
router.get('/announcements', protect, wardenOnly, async (req, res) => {
  try {
    const hostel = await Hostel.findOne({ wardenId: req.userId });
    
    if (!hostel) {
      return res.json({ success: true, data: [] });
    }

    const announcements = await Announcement.find({
      hostelId: hostel._id,
      creatorModel: 'Warden',
      isActive: true
    }).sort('-createdAt');

    res.json({
      success: true,
      data: announcements
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: 'Error fetching announcements' });
  }
});

// Delete announcement
router.delete('/announcements/:id', protect, wardenOnly, async (req, res) => {
  try {
    const announcement = await Announcement.findOne({
      _id: req.params.id,
      createdBy: req.userId
    });

    if (!announcement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found or unauthorized' 
      });
    }

    // Soft delete - just mark as inactive
    announcement.isActive = false;
    await announcement.save();

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ success: false, message: 'Error deleting announcement' });
  }
});

// Update announcement
router.put('/announcements/:id', protect, wardenOnly, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const announcement = await Announcement.findOne({
      _id: req.params.id,
      createdBy: req.userId
    });

    if (!announcement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found or unauthorized' 
      });
    }

    announcement.title = title;
    announcement.content = description;
    await announcement.save();

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ success: false, message: 'Error updating announcement' });
  }
});

// Update room status
router.put('/room-status/:id', protect, wardenOnly, async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const oldStatus = room.status;
    room.status = status;
    if (remarks) room.remarks = remarks;
    if (status === 'Maintenance') room.lastMaintenanceDate = new Date();

    await room.save();

    // Notify students in this room if status changes to maintenance
    if (status === 'Maintenance' && oldStatus !== 'Maintenance') {
      const students = await Student.find({ room: room._id });
      
      const notificationPromises = students.map(student =>
        createNotification(
          student._id,
          'Student',
          'room_allocation',
          'Room Maintenance',
          `Your room ${room.roomNo} is scheduled for maintenance. Please contact the warden for more information.`,
          room._id,
          'Room'
        )
      );

      await Promise.all(notificationPromises);
    }

    res.json({
      success: true,
      message: 'Room status updated successfully',
      data: room
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating room status' });
  }
});

// Get complaints
router.get('/complaints', protect, wardenOnly, async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    const hostel = await Hostel.findOne({ wardenId: req.userId });
    
    if (!hostel) {
      return res.json({ success: true, data: [] });
    }

    // Get real complaints from the database
    let query = { hostelName: hostel.hostelName };
    
    if (status !== 'all') {
      query.status = status;
    }

    const complaints = await Complaint.find(query)
      .populate('studentId', 'fullName roomNumber')
      .sort('-createdAt');

    // Format complaints to match frontend expectations
    const formattedComplaints = complaints.map(complaint => ({
      _id: complaint._id,
      complaintId: `C${new Date(complaint.createdAt).getFullYear()}${String(complaint._id).slice(-3)}`,
      studentName: complaint.studentName,
      roomNo: complaint.roomNumber,
      issueType: complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1),
      description: complaint.description,
      dateSubmitted: complaint.createdAt,
      status: complaint.status,
      priority: complaint.priority,
      remarks: complaint.resolution
    }));

    res.json({
      success: true,
      data: formattedComplaints
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ success: false, message: 'Error fetching complaints' });
  }
});
// Get student notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({ 
      userId: req.userId,
      userType: 'Student'
    })
    .sort('-createdAt')
    .limit(50);

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', protect, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    await Notification.findByIdAndUpdate(req.params.id, {
      read: true,
      readAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update complaint status
router.put('/complaints/:id', protect, wardenOnly, async (req, res) => {
  try {
    const { status, remarks } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const oldStatus = complaint.status;
    complaint.status = status;
    if (remarks) {
      complaint.resolution = remarks;
    }
    if (status === 'resolved') {
      complaint.resolvedAt = new Date();
    }
    complaint.assignedTo = req.userId;

    await complaint.save();

    // Notify student about complaint status update
    if (complaint.studentId && oldStatus !== status) {
      await createNotification(
        complaint.studentId,
        'Student',
        'complaint',
        'Complaint Status Update',
        `Your complaint #${complaint._id.toString().slice(-6)} has been ${status}. ${remarks ? `Remarks: ${remarks}` : ''}`,
        complaint._id,
        'Complaint'
      );
    }
    
    res.json({
      success: true,
      message: 'Complaint updated successfully'
    });
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({ success: false, message: 'Error updating complaint' });
  }
});

module.exports = router;
