const fs = require('fs');
const path = require('path');

const createUploadDirectories = () => {
  const directories = [
    'uploads',
    'uploads/images',
    'uploads/videos',
    'uploads/payment-proofs',
    'uploads/qr-codes'
  ];

  directories.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
};

module.exports = createUploadDirectories;
