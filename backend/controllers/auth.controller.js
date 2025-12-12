const Student = require('../models/Student');
const Warden = require('../models/Warden');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const emailService = require('../utils/emailService');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

// Login Controller
const login = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    let user;
    
    // Check role and find user
    switch(role) {
      case 'student':
        user = await Student.findOne({ username });
        break;
      case 'warden':
        user = await Warden.findOne({ username });
        break;
      case 'admin':
        user = await Admin.findOne({ username });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
    }
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // For students, check if fully registered
    if (role === 'student' && !user.isFullyRegistered) {
      return res.status(401).json({
        success: false,
        message: 'Please complete your registration process first'
      });
    }
    
    // For non-admin users, check if approved
    if (role !== 'admin' && user.status !== 'approved') {
      return res.status(401).json({
        success: false,
        message: 'Your account is pending approval'
      });
    }
    
    // Check password
    const isPasswordValid = await user.matchPassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Update last login for admin
    if (role === 'admin') {
      user.lastLogin = new Date();
      await user.save();
    }
    
    // Generate token
    const token = generateToken(user._id, role);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Register Student Controller
const registerStudent = async (req, res) => {
  try {
    const {
      fullName,
      gender,
      dateOfBirth,
      studentId,
      aadharNumber,
      department,
      year,
      course,
      email,
      mobile,
      parentName,
      parentMobile,
      permanentAddress,
      emergencyContact,
      hostelName,
      roomType,
      messPreference,
      username,
      password,
      updateOnly,
      partialRegistration,
      completeRegistration
    } = req.body;
    
    // Handle complete registration for existing approved students
    if (completeRegistration) {
      const existingStudent = await Student.findOne({ email });
      
      if (!existingStudent || existingStudent.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Invalid request. Student not found or not approved.'
        });
      }
      
      // Check if username is already taken
      const usernameExists = await Student.findOne({ 
        username, 
        _id: { $ne: existingStudent._id } 
      });
      
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken. Please choose another.'
        });
      }
      
      // Update credentials
      existingStudent.username = username;
      existingStudent.password = password;
      existingStudent.isFullyRegistered = true;
      
      await existingStudent.save();
      
      return res.status(200).json({
        success: true,
        message: 'Registration completed successfully! You can now login with your credentials.'
      });
    }
    
    // Handle update for existing approved students
    if (updateOnly) {
      // This is an existing approved student updating their preferences
      const existingStudent = await Student.findOne({ email });
      
      if (!existingStudent || existingStudent.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Invalid request. Student not found or not approved.'
        });
      }
      
      // Check if username is already taken by another student
      if (username && username !== existingStudent.username) {
        const usernameExists = await Student.findOne({ 
          username, 
          _id: { $ne: existingStudent._id } 
        });
        
        if (usernameExists) {
          return res.status(400).json({
            success: false,
            message: 'Username already taken. Please choose another.'
          });
        }
      }
      
      // Update only the allowed fields
      existingStudent.hostelName = hostelName || existingStudent.hostelName;
      existingStudent.roomType = roomType || existingStudent.roomType;
      existingStudent.messPreference = messPreference || existingStudent.messPreference;
      existingStudent.username = username || existingStudent.username;
      
      // Update password if provided
      if (password) {
        existingStudent.password = password;
      }
      
      // Mark as fully registered
      existingStudent.isFullyRegistered = true;
      
      await existingStudent.save();
      
      // Send confirmation email
      try {
        await emailService.sendHotelPreferencesUpdateEmail(email, existingStudent.fullName);
      } catch (emailError) {
        console.error('Failed to send update confirmation email:', emailError);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Hostel preferences updated successfully! You can now login with your credentials.'
      });
    }
    
    // Handle partial registration for new students
    if (partialRegistration) {
      // Check if student already exists
      const existingStudent = await Student.findOne({
        $or: [
          { email },
          { studentId },
          { aadharNumber }
        ]
      });
      
      if (existingStudent) {
        if (existingStudent.email === email) {
          if (existingStudent.status === 'rejected') {
            return res.status(400).json({
              success: false,
              message: 'Your previous registration was rejected. Please contact admin at gowthamchmi007@gmail.com.'
            });
          } else if (existingStudent.status === 'pending') {
            return res.status(400).json({
              success: false,
              message: 'Your registration is already pending approval. Please check your email for updates.'
            });
          } else if (existingStudent.status === 'approved') {
            return res.status(400).json({
              success: false,
              message: 'This email is already approved. Please use the email check process to complete registration.'
            });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: 'Student already exists with this email, student ID, or Aadhar number'
        });
      }
      
      // Create new student with partial data
      const student = new Student({
        fullName,
        gender,
        dateOfBirth,
        studentId,
        aadharNumber,
        department,
        year,
        course,
        email,
        mobile,
        parentName,
        parentMobile,
        permanentAddress,
        emergencyContact,
        hostelName,
        roomType,
        messPreference,
        username,
        password,
        isFullyRegistered: false // Mark as partially registered
      });
      
      await student.save();
      
      // Send pending email notification
      try {
        await emailService.sendRegistrationPendingEmail(email, fullName, 'student');
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
      
      return res.status(201).json({
        success: true,
        message: 'Registration submitted successfully! You will receive an email notification once admin approves your request.'
      });
    }
    
    // Regular registration for new students (full registration - backward compatibility)
    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [
        { username },
        { email },
        { studentId },
        { aadharNumber }
      ]
    });
    
    if (existingStudent) {
      // Check if email was previously rejected
      if (existingStudent.email === email && existingStudent.status === 'rejected') {
        return res.status(400).json({
          success: false,
          message: 'Your previous registration was rejected. Please contact admin at gowthamchmi007@gmail.com.'
        });
      }
      
      // Check if email is pending
      if (existingStudent.email === email && existingStudent.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Your registration is already pending approval. Please check your email for updates.'
        });
      }
      
      // Check if email is approved but trying to register again
      if (existingStudent.email === email && existingStudent.status === 'approved') {
        return res.status(400).json({
          success: false,
          message: 'This email is already registered and approved. Please use the email check process to update your preferences.'
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Student already exists with this username, email, student ID, or Aadhar number'
      });
    }
    
    // Create new student
    const student = new Student({
      fullName,
      gender,
      dateOfBirth,
      studentId,
      aadharNumber,
      department,
      year,
      course,
      email,
      mobile,
      parentName,
      parentMobile,
      permanentAddress,
      emergencyContact,
      hostelName,
      roomType,
      messPreference,
      username,
      password,
      isFullyRegistered: true // For backward compatibility, full registrations are marked as fully registered
    });
    
    await student.save();
    
    // Send pending email notification
    try {
      await emailService.sendRegistrationPendingEmail(email, fullName, 'student');
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Continue with registration even if email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! You will receive an email notification. Please wait for admin approval.'
    });
    
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// Register Warden Controller
const registerWarden = async (req, res) => {
  try {
    const {
      fullName,
      gender,
      email,
      mobile,
      designation,
      assignedHostel,
      experience,
      qualification,
      address,
      username,
      password
    } = req.body;
    
    // Check if warden already exists
    const existingWarden = await Warden.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingWarden) {
      // Check if email was previously rejected
      if (existingWarden.email === email && existingWarden.status === 'rejected') {
        return res.status(400).json({
          success: false,
          message: 'Your previous registration was rejected. Please contact admin at gowthamchmi007@gmail.com.'
        });
      }
      
      // Check if email is pending
      if (existingWarden.email === email && existingWarden.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Your registration is already pending approval. Please check your email for updates.'
        });
      }
      
      // Check if email is approved
      if (existingWarden.email === email && existingWarden.status === 'approved') {
        return res.status(400).json({
          success: false,
          message: 'This email is already registered and approved. Please login with your credentials.'
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Warden already exists with this username or email'
      });
    }
    
    // Create new warden
    const warden = new Warden({
      fullName,
      gender,
      email,
      mobile,
      designation,
      assignedHostel,
      experience,
      qualification,
      address,
      username,
      password
    });
    
    await warden.save();
    
    // Send pending email notification
    try {
      await emailService.sendRegistrationPendingEmail(email, fullName, 'warden');
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Continue with registration even if email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! You will receive an email notification. Please wait for admin approval.'
    });
    
  } catch (error) {
    console.error('Warden registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// Check Email Status
const checkEmailStatus = async (req, res) => {
  try {
    const { email, role } = req.body;
    
    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email and role are required'
      });
    }
    
    let user;
    if (role === 'student') {
      user = await Student.findOne({ email }).select('status fullName gender isFullyRegistered');
    } else if (role === 'warden') {
      user = await Warden.findOne({ email }).select('status fullName');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }
    
    if (!user) {
      return res.json({
        success: true,
        status: 'new',
        message: 'New registration'
      });
    }
    
    // Return detailed status information
    const response = {
      success: true,
      status: user.status,
      fullName: user.fullName,
      message: `Registration status: ${user.status}`
    };
    
    // Add specific messages based on status
    if (user.status === 'approved') {
      if (role === 'student' && !user.isFullyRegistered) {
        response.message = 'Your registration is approved. Please complete your hostel preferences and create login credentials.';
        response.needsCompletion = true;
      } else {
        response.message = 'Your registration is approved. You can login with your credentials.';
        response.needsCompletion = false;
      }
    } else if (user.status === 'pending') {
      response.message = 'Your registration is pending approval. Please check your email for updates.';
    } else if (user.status === 'rejected') {
      response.message = 'Your registration was rejected. Please contact admin at gowthamchmi007@gmail.com.';
    }
    
    // For students, also return gender for routing purposes
    if (role === 'student' && user.gender) {
      response.gender = user.gender;
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('Error checking email status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking email status. Please try again.'
    });
  }
};

// Generate Token for Approved Student - NEW FUNCTION
const generateTokenForApprovedStudent = async (req, res) => {
  try {
    const { email } = req.body;
    
    const student = await Student.findOne({ email, status: 'approved' });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or not approved'
      });
    }
    
    // Generate token
    const token = generateToken(student._id, 'student');
    
    res.json({
      success: true,
      token,
      user: {
        id: student._id,
        email: student.email,
        fullName: student.fullName,
        gender: student.gender
      }
    });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating authentication token'
    });
  }
};

module.exports = {
  login,
  registerStudent,
  registerWarden,
  checkEmailStatus,
  generateTokenForApprovedStudent
};
