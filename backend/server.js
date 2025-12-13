// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');

// MongoDB connection helper
const connectDB = require('./config/database');

// Import utilities
const createUploadDirectories = require('./utils/createDirectories');

// Import routes
const hostelRoutes = require('./routes/hostel.routes');
const roomRoutes = require('./routes/room.routes');
const studentDashboardRoutes = require('./routes/student.dashboard.routes');
const wardenDashboardRoutes = require('./routes/warden.dashboard.routes');
const feeRoutes = require('./routes/fee.routes');
const studentNotificationRoutes = require('./routes/student.notifications.routes');

// Initialize app
const app = express();

// Create upload folders
createUploadDirectories();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Pre-auth routes
app.use('/api/student', studentDashboardRoutes);
app.use('/api/warden', wardenDashboardRoutes);
app.use('/api/fees', feeRoutes);

// Import routes AFTER initial middleware
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
app.use('/api/notifications', notificationRoutes);
app.use('/api/student/notifications', studentNotificationRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Hostel ERP API is running!',
    version: '1.0.0',
  });
});

// Test email
app.post('/api/test-email', async (req, res) => {
  const emailService = require('./utils/emailService');

  try {
    await emailService.sendTestEmail();
    res.json({ success: true, message: 'Test email sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server error' });
});

// Admin initialization
async function initializeAdmin() {
  try {
    const Admin = require('./models/Admin');

    const exists = await Admin.findOne({
      username: process.env.ADMIN_USERNAME,
    });

    if (!exists) {
      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD,
        10
      );

      await Admin.create({
        username: process.env.ADMIN_USERNAME,
        password: hashedPassword,
        email: 'admin@hostel.com',
        fullName: 'System Administrator',
      });

      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin already exists');
    }
  } catch (error) {
    console.error('❌ Admin init error:', error);
  }
}

// 🚀 START SERVER FIRST (RENDER SAFE)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `📦 MongoDB URI: ${process.env.MONGODB_URI ? 'LOADED' : 'NOT LOADED'}`
  );

  // 🔗 Connect DB AFTER server is live
  connectDB()
    .then(() => {
      console.log('✅ MongoDB connected');

      // Init admin + cron AFTER DB
      initializeAdmin();
      require('./utils/cronJobs');
      console.log('✅ Cron jobs initialized');
    })
    .catch((err) => {
      console.error('❌ MongoDB connection failed:', err.message);
    });
});
