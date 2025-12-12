const nodemailer = require('nodemailer');

// Debug: Check if environment variable is loaded
console.log('📧 Email Service Initialization:');
console.log('   - Gmail User: gowthamchmi007@gmail.com');
console.log('   - Gmail App Password:', process.env.GMAIL_APP_PASSWORD ? `${process.env.GMAIL_APP_PASSWORD.substring(0, 4)}****` : 'NOT LOADED');

// Create transporter with Gmail service and security workaround
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gowthamchmi007@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // This bypasses the certificate validation
  }
});

// Verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Email transporter verification failed:', error.message);
    if (error.message.includes('self-signed certificate')) {
      console.log('   ⚠️  Certificate issue detected - email will still work');
      console.log('   ℹ️  This is usually due to corporate firewall or antivirus');
    }
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

const emailService = {
  // Send approval email
  sendApprovalEmail: async (recipientEmail, recipientName, role) => {
    console.log(`📧 Attempting to send approval email to: ${recipientEmail}`);
    console.log(`📧 Recipient name: ${recipientName}, Role: ${role}`);
    
    const mailOptions = {
      from: '"Hostel ERP Admin" <gowthamchmi007@gmail.com>',
      to: recipientEmail,
      subject: 'Hostel Registration Approved ✅',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B6B4A 0%, #A67C52 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Registration Approved!</h1>
          </div>
          <div style="padding: 30px; background-color: #f5f5f5;">
            <h2 style="color: #333;">Dear ${recipientName},</h2>
            <p style="color: #555; font-size: 16px;">
              We are pleased to inform you that your ${role} registration for the Hostel Management System has been <strong style="color: #4CAF50;">approved</strong> by the administrator.
            </p>
            <p style="color: #555; font-size: 16px;">
              You can now log in to your account using your credentials.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/login/${role}" style="background: #8B6B4A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">Login Now</a>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #777; font-size: 14px;">
              If you have any questions, please contact us at gowthamchmi007@gmail.com
            </p>
          </div>
        </div>
      `
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Approval email sent successfully');
      console.log('Message ID:', info.messageId);
      console.log('Response:', info.response);
      return true;
    } catch (error) {
      console.error('❌ Error sending approval email:', error.message);
      console.error('Full error:', error);
      throw error;
    }
  },

  // Send rejection email
  sendRejectionEmail: async (recipientEmail, recipientName, role, reason = '') => {
    console.log(`📧 Attempting to send rejection email to: ${recipientEmail}`);
    
    const mailOptions = {
      from: '"Hostel ERP Admin" <gowthamchmi007@gmail.com>',
      to: recipientEmail,
      subject: 'Hostel Registration Status ❌',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f44336; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Registration Not Approved</h1>
          </div>
          <div style="padding: 30px; background-color: #f5f5f5;">
            <h2 style="color: #333;">Dear ${recipientName},</h2>
            <p style="color: #555; font-size: 16px;">
              We regret to inform you that your ${role} registration for the Hostel Management System has been <strong style="color: #f44336;">declined</strong> by the administrator.
            </p>
            ${reason ? `<p style="color: #555; font-size: 16px;"><strong>Reason:</strong> ${reason}</p>` : ''}
            <p style="color: #555; font-size: 16px;">
              Please contact the administration office for more information or to resolve any issues.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #777; font-size: 14px;">
              For assistance, please contact us at gowthamchmi007@gmail.com
            </p>
          </div>
        </div>
      `
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Rejection email sent successfully');
      console.log('Message ID:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error sending rejection email:', error.message);
      throw error;
    }
  },

  // Send registration pending email
  sendRegistrationPendingEmail: async (recipientEmail, recipientName, role) => {
    console.log(`📧 Attempting to send pending email to: ${recipientEmail}`);
    
    const mailOptions = {
      from: '"Hostel ERP Admin" <gowthamchmi007@gmail.com>',
      to: recipientEmail,
      subject: 'Registration Received - Pending Approval ⏳',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2196F3; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Registration Received!</h1>
          </div>
          <div style="padding: 30px; background-color: #f5f5f5;">
            <h2 style="color: #333;">Dear ${recipientName},</h2>
            <p style="color: #555; font-size: 16px;">
              Thank you for registering as a ${role} in our Hostel Management System.
            </p>
            <p style="color: #555; font-size: 16px;">
              Your registration is currently <strong>pending approval</strong> from the administrator. You will receive an email notification once your registration has been reviewed.
            </p>
            <p style="color: #555; font-size: 16px;">
              This process typically takes 24-48 hours. We appreciate your patience.
            </p>
            <p style="color: #ea0b0bff; font-size: 16px;">
              AFTER THE ADMIN APPROVAL YOU CONTINUE YOU ROOM REGISTER WORK IN REGISTER SECTION
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #777; font-size: 14px;">
              If you have any urgent queries, please contact us at gowthamchmi007@gmail.com
            </p>
          </div>
        </div>
      `
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Registration pending email sent successfully');
      console.log('Message ID:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error sending registration pending email:', error.message);
      throw error;
    }
  },

  // Send hotel preferences update email
  sendHotelPreferencesUpdateEmail: async (recipientEmail, recipientName) => {
    const mailOptions = {
      from: '"Hostel ERP Admin" <gowthamchmi007@gmail.com>',
      to: recipientEmail,
      subject: 'Hostel Preferences Updated Successfully ✅',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B6B4A 0%, #A67C52 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Preferences Updated!</h1>
          </div>
          <div style="padding: 30px; background-color: #f5f5f5;">
            <h2 style="color: #333;">Dear ${recipientName},</h2>
            <p style="color: #555; font-size: 16px;">
              Your hostel preferences have been successfully updated in our system.
            </p>
            <p style="color: #555; font-size: 16px;">
              You can now log in to your account using your new credentials.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/login/student" style="background: #8B6B4A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">Login Now</a>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #777; font-size: 14px;">
              If you have any questions, please contact us at gowthamchmi007@gmail.com
            </p>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Hostel preferences update email sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Error sending preferences update email:', error.message);
      throw error;
    }
  },

  // Send hostel assignment email
  sendHostelAssignmentEmail: async (recipientEmail, wardenName, hostelName, hostelCode, location, totalRooms, capacity) => {
    console.log(`📧 Attempting to send hostel assignment email to: ${recipientEmail}`);
    
    const mailOptions = {
      from: '"Hostel ERP Admin" <gowthamchmi007@gmail.com>',
      to: recipientEmail,
      subject: `New Hostel Assignment - ${hostelName} 🏢`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B6B4A 0%, #A67C52 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">New Hostel Assignment!</h1>
          </div>
          <div style="padding: 30px; background-color: #f5f5f5;">
            <h2 style="color: #333;">Dear ${wardenName},</h2>
            <p style="color: #555; font-size: 16px;">
              You have been assigned as the warden for a new hostel in our management system.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #8B6B4A; margin-top: 0;">Hostel Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Hostel Name:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${hostelName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Hostel Code:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${hostelCode}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Location:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${location}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Total Rooms:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${totalRooms}</td>
                </tr>
                <tr>
                  <td style="padding: 10px;"><strong>Total Capacity:</strong></td>
                  <td style="padding: 10px;">${capacity} students</td>
                </tr>
              </table>
            </div>
            
            <p style="color: #555; font-size: 16px;">
              Please log in to your dashboard to view complete details and manage the hostel operations.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/login/warden" style="background: #8B6B4A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">Access Dashboard</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #777; font-size: 14px;">
              If you have any questions, please contact the administration at gowthamchmi007@gmail.com
            </p>
          </div>
        </div>
      `
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Hostel assignment email sent successfully');
      console.log('Message ID:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error sending hostel assignment email:', error.message);
      
      // If it's a certificate error, we'll just log it but not throw
      if (error.message.includes('self-signed certificate')) {
        console.log('⚠️  Certificate warning - this is usually due to network security settings');
        console.log('⚠️  The email might still be sent. Please check the recipient\'s inbox.');
      }
      
      throw error;
    }
  },

  // Test email function
  sendTestEmail: async () => {
    const testEmail = 'gowthamchmi007@gmail.com';
    console.log('📧 Attempting to send test email to:', testEmail);
    console.log('   Using password:', process.env.GMAIL_APP_PASSWORD ? 'YES' : 'NO');
    
    const mailOptions = {
      from: '"Hostel ERP Test" <gowthamchmi007@gmail.com>',
      to: testEmail,
      subject: 'Test Email - Hostel ERP',
      text: 'This is a test email from Hostel ERP system. If you receive this, email configuration is working!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Test Email</h2>
          <p>This is a test email from Hostel ERP system.</p>
          <p>If you received this, your email configuration is working correctly!</p>
          <p>Gmail App Password is: ${process.env.GMAIL_APP_PASSWORD ? 'SET (' + process.env.GMAIL_APP_PASSWORD.length + ' characters)' : 'NOT SET'}</p>
          <p>Sent at: ${new Date().toLocaleString()}</p>
        </div>
      `
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Test email sent successfully');
      console.log('Message ID:', info.messageId);
      console.log('Response:', info.response);
      return true;
    } catch (error) {
      console.error('❌ Error sending test email:', error.message);
      
      // Log more specific error information
      if (error.code === 'EAUTH') {
        console.error('⚠️  Authentication failed - check your Gmail app password');
      } else if (error.message.includes('self-signed certificate')) {
        console.error('⚠️  Certificate issue - this might be due to firewall or antivirus');
      }
      
      throw error;
    }
  }
};

module.exports = emailService;
