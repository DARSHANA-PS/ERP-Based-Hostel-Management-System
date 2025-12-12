const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Student = require('../models/Student');

// Get student profile
router.get('/profile', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.userId).select('-password');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// Update student profile
router.put('/profile', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.userId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Only allow updating certain fields
    const allowedUpdates = ['mobile', 'parentMobile', 'permanentAddress', 'emergencyContact'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field]) {
        updates[field] = req.body[field];
      }
    });
    
    const updatedStudent = await Student.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true }
    ).select('-password');
    
    res.json({
      success: true,
      data: updatedStudent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// Get room details
router.get('/room', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.userId).select('roomNumber bedNumber hostelName');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        roomNumber: student.roomNumber || 'Not Assigned',
        bedNumber: student.bedNumber || 'Not Assigned',
        hostelName: student.hostelName
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching room details'
    });
  }
});

// Get available hostels based on student gender
router.get('/hostels/available', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.userId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const Hostel = require('../models/Hostel');
    const Room = require('../models/Room');
    
    // Get hostels based on student gender - ensure case matches
    const hostelType = student.gender; // This should already be 'Male' or 'Female' from the database
    
    console.log('Student gender:', student.gender);
    console.log('Looking for hostel type:', hostelType);
    
    const hostels = await Hostel.find({ 
      hostelType: hostelType,
      status: { $ne: 'Inactive' } // Don't show inactive hostels
    })
    .populate('wardenId', 'fullName email mobile')
    .sort('-createdAt');
    
    console.log('Found hostels:', hostels.length);

    // Get room statistics for each hostel
    const hostelsWithStats = await Promise.all(
      hostels.map(async (hostel) => {
        const rooms = await Room.find({ hostelId: hostel._id });
        const availableRooms = rooms.filter(room => room.status === 'Available' && room.occupied < room.capacity).length;
        const occupiedBeds = rooms.reduce((sum, room) => sum + room.occupied, 0);

        return {
          ...hostel.toObject(),
          availableRooms,
          occupiedBeds,
          totalBeds: hostel.hostelCapacity,
          availableBeds: hostel.hostelCapacity - occupiedBeds
        };
      })
    );

    res.json({
      success: true,
      data: hostelsWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching hostels',
      error: error.message
    });
  }
});

// Get rooms for a specific hostel
router.get('/hostels/:hostelId/rooms', protect, async (req, res) => {
  try {
    const Room = require('../models/Room');
    const { status, floor } = req.query;
    const filter = { hostelId: req.params.hostelId };
    
    if (status) filter.status = status;
    if (floor) filter.floorNo = parseInt(floor);
    
    // Only show available rooms
    filter.$expr = { $lt: ['$occupied', '$capacity'] };
    filter.status = 'Available'; // Only show available status rooms
    
    const rooms = await Room.find(filter)
      .populate('hostelId', 'hostelName hostelType')
      .sort({ roomNo: 1 });

    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms',
      error: error.message
    });
  }
});

// Book a room
router.post('/book-room', protect, async (req, res) => {
  try {
    const { roomId } = req.body;
    const Room = require('../models/Room');
    const Hostel = require('../models/Hostel');
    
    const student = await Student.findById(req.userId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Check if student already has a room
    if (student.roomNumber) {
      return res.status(400).json({
        success: false,
        message: 'You already have a room allocated'
      });
    }
    
    // Find the room
    const room = await Room.findById(roomId).populate('hostelId');
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Check if room is available
    if (room.occupied >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Room is already full'
      });
    }
    
    // Check if hostel matches student gender
    if (room.hostelId.hostelType !== student.gender) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hostel type for your gender'
      });
    }
    
    // Allocate the room
    room.students.push(student._id);
    room.occupied += 1;
    await room.save();
    
    // Update student record
    student.roomNumber = room.roomNo;
    student.hostelName = room.hostelId.hostelName;
    await student.save();
    
    // Update hostel available rooms count
    const hostel = await Hostel.findById(room.hostelId._id);
    const availableRooms = await Room.countDocuments({
      hostelId: room.hostelId._id,
      status: 'Available',
      $expr: { $lt: ['$occupied', '$capacity'] }
    });
    hostel.availableRooms = availableRooms;
    await hostel.save();
    
    res.json({
      success: true,
      message: 'Room booked successfully!',
      data: {
        roomNumber: room.roomNo,
        hostelName: room.hostelId.hostelName,
        floorNo: room.floorNo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error booking room',
      error: error.message
    });
  }
});

// Get room statistics for a hostel
router.get('/hostels/:hostelId/stats', protect, async (req, res) => {
  try {
    const Room = require('../models/Room');
    const rooms = await Room.find({ hostelId: req.params.hostelId });
    
    const stats = {
      totalRooms: rooms.length,
      availableRooms: rooms.filter(r => r.status === 'Available' && r.occupied < r.capacity).length,
      fullRooms: rooms.filter(r => r.status === 'Full' || r.occupied >= r.capacity).length,
      maintenanceRooms: rooms.filter(r => r.status === 'Maintenance').length,
      totalCapacity: rooms.reduce((sum, r) => sum + r.capacity, 0),
      totalOccupied: rooms.reduce((sum, r) => sum + r.occupied, 0),
      floorWiseStats: {}
    };

    // Calculate floor-wise statistics
    const floors = [...new Set(rooms.map(r => r.floorNo))];
    floors.forEach(floor => {
      const floorRooms = rooms.filter(r => r.floorNo === floor);
      stats.floorWiseStats[`Floor ${floor}`] = {
        totalRooms: floorRooms.length,
        available: floorRooms.filter(r => r.status === 'Available' && r.occupied < r.capacity).length,
        occupied: floorRooms.reduce((sum, r) => sum + r.occupied, 0)
      };
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching room statistics',
      error: error.message
    });
  }
});

module.exports = router;
