const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const Room = require('../models/Room');
const Hostel = require('../models/Hostel');
const Student = require('../models/Student');

// Get all rooms with filters
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const { hostelId, status, floor } = req.query;
    const filter = {};

    if (hostelId) filter.hostelId = hostelId;
    if (status) filter.status = status;
    if (floor) filter.floorNo = parseInt(floor);

    const rooms = await Room.find(filter)
      .populate('hostelId', 'hostelName hostelType')
      .populate('students', 'fullName studentId mobile')
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

// Get single room details
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('hostelId', 'hostelName hostelType')
      .populate('students', 'fullName studentId mobile email department year');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching room details',
      error: error.message
    });
  }
});

// Get students by room - NEW ROUTE
router.get('/:roomId/students', protect, adminOnly, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)
      .populate('students', 'fullName studentId mobile email department year parentName parentContact');
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      students: room.students,
      roomInfo: {
        roomNo: room.roomNo,
        capacity: room.capacity,
        occupied: room.occupied
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
});

// Update room status
router.put('/status/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Don't allow changing to available if room is occupied
    if (status === 'Available' && room.occupied > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark room as available when students are allocated'
      });
    }

    room.status = status;
    if (remarks) room.remarks = remarks;
    if (status === 'Maintenance') room.lastMaintenanceDate = new Date();

    await room.save();

    // Update hostel available rooms count
    const hostel = await Hostel.findById(room.hostelId);
    const availableRooms = await Room.countDocuments({
      hostelId: room.hostelId,
      status: 'Available'
    });
    hostel.availableRooms = availableRooms;
    await hostel.save();

    res.json({
      success: true,
      message: 'Room status updated successfully',
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating room status',
      error: error.message
    });
  }
});

// Allocate student to room
router.post('/allocate/:roomId', protect, adminOnly, async (req, res) => {
  try {
    const { studentId } = req.body;
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (room.occupied >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Room is already full'
      });
    }

    // Check if student already allocated
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (student.roomNumber) {
      return res.status(400).json({
        success: false,
        message: 'Student already allocated to a room'
      });
    }

    // Allocate student
    room.students.push(studentId);
    room.occupied += 1;
    await room.save();

    // Update student record
    student.roomNumber = room.roomNo;
    await student.save();

    res.json({
      success: true,
      message: 'Student allocated successfully',
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error allocating student',
      error: error.message
    });
  }
});

// Remove student from room
router.post('/deallocate/:roomId', protect, adminOnly, async (req, res) => {
  try {
    const { studentId } = req.body;
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Remove student from room
    room.students = room.students.filter(id => id.toString() !== studentId);
    room.occupied = Math.max(0, room.occupied - 1);
    await room.save();

    // Update student record
    await Student.findByIdAndUpdate(studentId, {
      roomNumber: null
    });

    res.json({
      success: true,
      message: 'Student removed from room successfully',
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing student',
      error: error.message
    });
  }
});

// Get room statistics by hostel
router.get('/stats/:hostelId', protect, adminOnly, async (req, res) => {
  try {
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
