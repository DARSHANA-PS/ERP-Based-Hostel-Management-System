// Load environment variables FIRST - before any imports
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');

// Import routes
const hostelRoutes = require('./routes/hostel.routes');
const roomRoutes = require('./routes/room.routes');
const studentDashboardRoutes = require('./routes/student.dashboard.routes');
const wardenDashboardRoutes = require('./routes/warden.dashboard.routes');
const feeRoutes = require('./routes/fee.routes');
const studentNotificationRoutes = require('./routes/student.notifications.routes');

// Import utilities
const createUploadDirectories = require('./utils/createDirectories');

// Initialize express app
const app = express();

// Create necessary directories for uploads
createUploadDirectories();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply routes before MongoDB connection
app.use('/api/student', studentDashboardRoutes);
app.use('/api/warden', wardenDashboardRoutes);
app.use('/api/fees', feeRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  // Initialize admin on first run
  initializeAdmin();
  // Start cron jobs
  const cronJobs = require('./utils/cronJobs');
  console.log('✅ Cron jobs initialized');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Import routes after MongoDB connection
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const wardenRoutes = require('./routes/warden.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/warden', wardenRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/warden', require('./routes/warden.dashboard.routes'));
app.use('/api/notifications', notificationRoutes);
app.use('/api/student/notifications', studentNotificationRoutes);
// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hostel ERP API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      student: '/api/student',
      warden: '/api/warden',
      admin: '/api/admin',
      hostels: '/api/hostels',
      rooms: '/api/rooms',
      fees: '/api/fees'
    }
  });
});

// Test email route
app.post('/api/test-email', async (req, res) => {
  console.log('Testing email configuration...');
  console.log('Gmail App Password exists:', !!process.env.GMAIL_APP_PASSWORD);
  console.log('Gmail App Password length:', process.env.GMAIL_APP_PASSWORD?.length);
  
  const emailService = require('./utils/emailService');
  
  try {
    await emailService.sendTestEmail();
    res.json({ 
      success: true, 
      message: 'Test email sent successfully! Check your inbox.',
      emailConfig: {
        passwordSet: !!process.env.GMAIL_APP_PASSWORD,
        passwordLength: process.env.GMAIL_APP_PASSWORD?.length
      }
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send test email',
      error: error.message,
      emailConfig: {
        passwordSet: !!process.env.GMAIL_APP_PASSWORD,
        passwordLength: process.env.GMAIL_APP_PASSWORD?.length
      }
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Initialize admin function
const initializeAdmin = async () => {
  try {
    const Admin = require('./models/Admin');
    
    // Check if admin already exists
    const adminExists = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
    
    if (!adminExists) {
      // Create admin
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      const admin = new Admin({
        username: process.env.ADMIN_USERNAME,
        password: hashedPassword,
        email: 'admin@hostel.com',
        fullName: 'System Administrator'
      });
      
      await admin.save();
      console.log('✅ Admin user initialized successfully');
      console.log('   Username:', process.env.ADMIN_USERNAME);
      console.log('   Password:', process.env.ADMIN_PASSWORD);
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  
  // Debug environment variables
  console.log('📧 Email Configuration Status:');
  console.log(`   - Gmail Password: ${process.env.GMAIL_APP_PASSWORD ? 'LOADED (' + process.env.GMAIL_APP_PASSWORD.length + ' chars)' : 'NOT LOADED'}`);
  console.log(`   - MongoDB URI: ${process.env.MONGODB_URI ? 'LOADED' : 'NOT LOADED'}`);
});
