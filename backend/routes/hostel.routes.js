const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { uploadHostelMedia } = require('../middleware/upload.middleware');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Warden = require('../models/Warden');
const emailService = require('../utils/emailService');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

// Get all hostels
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const hostels = await Hostel.find()
      .populate('wardenId', 'fullName email mobile')
      .sort('-createdAt');

    // Get room statistics for each hostel
    const hostelsWithStats = await Promise.all(
      hostels.map(async (hostel) => {
        const rooms = await Room.find({ hostelId: hostel._id });
        const availableRooms = rooms.filter(room => room.status === 'Available').length;
        const occupiedBeds = rooms.reduce((sum, room) => sum + room.occupied, 0);

        return {
          ...hostel.toObject(),
          availableRooms,
          occupiedBeds,
          totalBeds: hostel.hostelCapacity
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

// Get single hostel
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id)
      .populate('wardenId', 'fullName email mobile designation');

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found'
      });
    }

    // Get room statistics
    const rooms = await Room.find({ hostelId: hostel._id });
    const stats = {
      totalRooms: rooms.length,
      availableRooms: rooms.filter(r => r.status === 'Available').length,
      fullRooms: rooms.filter(r => r.status === 'Full').length,
      maintenanceRooms: rooms.filter(r => r.status === 'Maintenance').length,
      totalOccupied: rooms.reduce((sum, room) => sum + room.occupied, 0)
    };

    res.json({
      success: true,
      data: {
        ...hostel.toObject(),
        stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching hostel details',
      error: error.message
    });
  }
});

// Create new hostel with media upload
router.post('/create', protect, adminOnly, uploadHostelMedia, async (req, res) => {
  try {
    // Check if hostel code already exists
    const existingHostel = await Hostel.findOne({ 
      hostelCode: req.body.hostelCode 
    });

    if (existingHostel) {
      return res.status(400).json({
        success: false,
        message: 'Hostel code already exists'
      });
    }

    // Prepare hostel data
    const hostelData = { ...req.body };
    
    // Add file paths if files were uploaded
    if (req.files) {
      if (req.files.hostelImage && req.files.hostelImage[0]) {
        hostelData.hostelImage = req.files.hostelImage[0].path;
      }
      if (req.files.hostelVideo && req.files.hostelVideo[0]) {
        hostelData.hostelVideo = req.files.hostelVideo[0].path;
      }
    }

    // Create hostel
    const hostel = new Hostel(hostelData);
    await hostel.save();

    // Auto-generate rooms
    const roomsPerFloor = Math.ceil(hostel.totalRooms / hostel.totalFloors);
    const rooms = [];

    let roomCount = 0;
    for (let floor = 1; floor <= hostel.totalFloors; floor++) {
      for (let room = 1; room <= roomsPerFloor && roomCount < hostel.totalRooms; room++) {
        roomCount++;
        const roomNo = `${floor}${room.toString().padStart(2, '0')}`;
        
        rooms.push({
          hostelId: hostel._id,
          roomNo,
          floorNo: floor,
          capacity: hostel.studentsPerRoom,
          occupied: 0,
          status: 'Available'
        });
      }
    }

    // Insert all rooms
    await Room.insertMany(rooms);

    // Send email to assigned warden
    try {
      const warden = await Warden.findById(hostel.wardenId);
      if (warden && warden.email) {
        await emailService.sendHostelAssignmentEmail(
          warden.email, 
          warden.fullName, 
          hostel.hostelName,
          hostel.hostelCode,
          hostel.location,
          hostel.totalRooms,
          hostel.hostelCapacity,
          hostel.perStudentAmount // Add this parameter
        );
        console.log('✅ Email sent to warden:', warden.email);
      }
    } catch (emailError) {
      console.error('❌ Failed to send email to warden:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: `Hostel created successfully with ${rooms.length} rooms. Email notification sent to warden.`,
      data: hostel
    });
  } catch (error) {
    // Clean up uploaded files if there's an error
    if (req.files) {
      for (const fieldname in req.files) {
        for (const file of req.files[fieldname]) {
          await fsPromises.unlink(file.path).catch(err => console.error('Error deleting file:', err));
        }
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating hostel',
      error: error.message
    });
  }
});

// Update hostel with media upload
router.put('/update/:id', protect, adminOnly, uploadHostelMedia, async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found'
      });
    }

    // Don't allow changing total rooms if rooms are already allocated
    if (req.body.totalRooms && req.body.totalRooms !== hostel.totalRooms) {
      const occupiedRooms = await Room.find({ 
        hostelId: hostel._id, 
        occupied: { $gt: 0 } 
      });

      if (occupiedRooms.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change total rooms when students are allocated'
        });
      }
    }

    // Store old file paths
    const oldImage = hostel.hostelImage;
    const oldVideo = hostel.hostelVideo;

    // Update hostel fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        hostel[key] = req.body[key];
      }
    });

    // Update file paths if new files were uploaded
    if (req.files) {
      if (req.files.hostelImage && req.files.hostelImage[0]) {
        hostel.hostelImage = req.files.hostelImage[0].path;
      }
      if (req.files.hostelVideo && req.files.hostelVideo[0]) {
        hostel.hostelVideo = req.files.hostelVideo[0].path;
      }
    }

    await hostel.save();

    // Delete old files if they were replaced
    if (req.files) {
      if (req.files.hostelImage && oldImage) {
        await fsPromises.unlink(oldImage).catch(err => console.error('Error deleting old image:', err));
      }
      if (req.files.hostelVideo && oldVideo) {
        await fsPromises.unlink(oldVideo).catch(err => console.error('Error deleting old video:', err));
      }
    }

    res.json({
      success: true,
      message: 'Hostel updated successfully',
      data: hostel
    });
  } catch (error) {
    // Clean up uploaded files if there's an error
    if (req.files) {
      for (const fieldname in req.files) {
        for (const file of req.files[fieldname]) {
          await fsPromises.unlink(file.path).catch(err => console.error('Error deleting file:', err));
        }
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating hostel',
      error: error.message
    });
  }
});

// Delete hostel
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found'
      });
    }

    // Check if any rooms are occupied
    const occupiedRooms = await Room.find({ 
      hostelId: hostel._id, 
      occupied: { $gt: 0 } 
    });

    if (occupiedRooms.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete hostel with occupied rooms'
      });
    }

    // Delete media files
    if (hostel.hostelImage) {
      await fsPromises.unlink(hostel.hostelImage).catch(err => console.error('Error deleting image:', err));
    }
    if (hostel.hostelVideo) {
      await fsPromises.unlink(hostel.hostelVideo).catch(err => console.error('Error deleting video:', err));
    }

    // Delete all rooms
    await Room.deleteMany({ hostelId: hostel._id });

    // Delete hostel
    await hostel.deleteOne();

    res.json({
      success: true,
      message: 'Hostel and all associated rooms deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting hostel',
      error: error.message
    });
  }
});

// Get hostel video stream - FIXED VERSION
router.get('/video/:id', protect, async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    
    if (!hostel || !hostel.hostelVideo) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const videoPath = path.resolve(hostel.hostelVideo);
    
    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      console.error('Video file not found:', videoPath);
      return res.status(404).json({
        success: false,
        message: 'Video file not found on server'
      });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Parse Range header
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Error streaming video:', error);
    res.status(500).json({
      success: false,
      message: 'Error streaming video',
      error: error.message
    });
  }
});

module.exports = router;
