const express = require('express');
const router = express.Router();
const { 
  login, 
  registerStudent, 
  registerWarden, 
  checkEmailStatus,
  generateTokenForApprovedStudent 
} = require('../controllers/auth.controller');

// Login route
router.post('/login', login);

// Registration routes
router.post('/register/student', registerStudent);
router.post('/register/warden', registerWarden);

// Check email status
router.post('/check-email', checkEmailStatus);

// Generate token for approved students
router.post('/generate-student-token', generateTokenForApprovedStudent);

module.exports = router;
