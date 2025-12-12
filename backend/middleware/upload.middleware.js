const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads';
const imagesDir = path.join(uploadsDir, 'images');
const videosDir = path.join(uploadsDir, 'videos');
const paymentProofsDir = path.join(uploadsDir, 'payment-proofs');
const qrCodesDir = path.join(uploadsDir, 'qr-codes');

// Create all directories
[uploadsDir, imagesDir, videosDir, paymentProofsDir, qrCodesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the upload directory based on file type
    if (file.fieldname === 'hostelImage') {
      cb(null, imagesDir);
    } else if (file.fieldname === 'hostelVideo') {
      cb(null, videosDir);
    } else if (file.fieldname === 'paymentProof') {
      cb(null, paymentProofsDir);
    } else if (file.fieldname === 'qrCode') {
      cb(null, qrCodesDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, name);
  }
});

// File filter for images and videos
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'hostelImage' || file.fieldname === 'qrCode' || file.fieldname === 'paymentProof') {
    // Allow only image files
    const allowedImageTypes = /jpeg|jpg|png|gif/;
    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedImageTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for ' + file.fieldname));
    }
  } else if (file.fieldname === 'hostelVideo') {
    // Allow only video files
    const allowedVideoTypes = /mp4|avi|mov|wmv|mkv|webm/;
    const extname = allowedVideoTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /video/.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed for hostel video'));
    }
  } else {
    cb(new Error('Unexpected field'));
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  }
});

module.exports = {
  uploadHostelMedia: upload.fields([
    { name: 'hostelImage', maxCount: 1 },
    { name: 'hostelVideo', maxCount: 1 }
  ]),
  single: (fieldname) => upload.single(fieldname), // This allows dynamic field names
  fields: upload.fields.bind(upload),
  upload: upload
};