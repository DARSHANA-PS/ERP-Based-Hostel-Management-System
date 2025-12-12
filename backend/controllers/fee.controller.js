const { FeeStructure, StudentFee, Transaction, Reminder } = require('../models/Fee');
const Student = require('../models/Student');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/emailService');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Helper function to create notifications
const createNotification = async (userId, userType, type, title, message, relatedId = null, relatedModel = null) => {
  try {
    const notification = new Notification({
      userId,
      userType,
      type,
      title,
      message,
      relatedId,
      relatedModel,
      priority: type === 'payment_verification' ? 'high' : 'medium'
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Admin Controllers
exports.createFeeStructure = async (req, res) => {
  try {
    console.log('Creating fee structure with data:', req.body);
    
    const { hostel, roomType, amount, dueDate, paymentDetails, academicYear } = req.body;
    
    // Validate required fields
    if (!hostel || !roomType || !amount || !dueDate || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: hostel, roomType, amount, dueDate, academicYear'
      });
    }
    
    // Parse paymentDetails if it's a string
    let parsedPaymentDetails = {};
    if (paymentDetails) {
      try {
        parsedPaymentDetails = typeof paymentDetails === 'string' 
          ? JSON.parse(paymentDetails) 
          : paymentDetails;
      } catch (error) {
        console.error('Error parsing payment details:', error);
        parsedPaymentDetails = {};
      }
    }
    
    // Create fee structure
    const feeStructure = new FeeStructure({
      hostel,
      roomType,
      amount: parseFloat(amount),
      academicYear,
      dueDate: new Date(dueDate),
      paymentDetails: parsedPaymentDetails,
      createdBy: req.userId
    });

    // Handle QR code upload if present
    if (req.file) {
      feeStructure.paymentDetails.qrCode = `/uploads/qr-codes/${req.file.filename}`;
    }

    await feeStructure.save();
    
    // Populate hostel info for the response
    await feeStructure.populate('hostel', 'hostelName hostelType');
    
    console.log('Fee structure saved:', feeStructure);

    // Find and assign fees to students
    try {
      const hostelDoc = await Hostel.findById(hostel);
      if (!hostelDoc) {
        console.log('Hostel not found:', hostel);
      } else {
        console.log('Found hostel:', hostelDoc.hostelName);
        
        // Method 1: Find students by hostelName
        const studentsByHostelName = await Student.find({ 
          hostelName: hostelDoc.hostelName,
          status: 'approved'
        });
        
        // Method 2: Find students by room allocation
        const rooms = await Room.find({
          hostelId: hostel,
          roomType: roomType
        });
        
        const roomIds = rooms.map(room => room._id);
        
        const studentsByRoom = await Student.find({
          room: { $in: roomIds },
          status: 'approved'
        });
        
        // Combine both methods and remove duplicates
        const allStudentIds = new Set([
          ...studentsByHostelName.map(s => s._id.toString()),
          ...studentsByRoom.map(s => s._id.toString())
        ]);
        
        const uniqueStudents = await Student.find({
          _id: { $in: Array.from(allStudentIds) }
        });
        
        console.log(`Found ${uniqueStudents.length} students for fee assignment`);
        
        if (uniqueStudents.length > 0) {
          const studentFees = uniqueStudents.map(student => ({
            student: student._id,
            hostel: hostel,
            room: student.room || null,
            feeStructure: feeStructure._id,
            totalAmount: parseFloat(amount),
            paidAmount: 0,
            pendingAmount: parseFloat(amount),
            dueDate: new Date(dueDate),
            status: 'pending'
          }));

          const createdFees = await StudentFee.insertMany(studentFees);
          console.log(`Created ${createdFees.length} fee records`);

          // Create notifications
          const notificationPromises = uniqueStudents.map(student => 
            createNotification(
              student._id,
              'Student',
              'fee_reminder',
              'New Fee Structure Created',
              `A new fee of ₹${amount} has been assigned to you for ${roomType} room. Due date: ${new Date(dueDate).toLocaleDateString()}`,
              feeStructure._id,
              'FeeStructure'
            )
          );

          await Promise.all(notificationPromises);
          console.log('Notifications created');
        }
      }
    } catch (error) {
      console.error('Error creating student fee records:', error);
    }

    res.status(201).json({
      success: true,
      message: 'Fee structure created successfully',
      data: feeStructure
    });
  } catch (error) {
    console.error('Error creating fee structure:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating fee structure',
      error: error.message
    });
  }
};

exports.getFeeStructures = async (req, res) => {
  try {
    const feeStructures = await FeeStructure.find()
      .populate('hostel', 'hostelName hostelType')
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: feeStructures
    });
  } catch (error) {
    console.error('Error fetching fee structures:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const feeStructure = await FeeStructure.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).populate('hostel', 'hostelName hostelType');

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: 'Fee structure not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fee structure updated successfully',
      data: feeStructure
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;

    // First delete all associated student fees
    await StudentFee.deleteMany({ feeStructure: id });

    const feeStructure = await FeeStructure.findByIdAndDelete(id);

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: 'Fee structure not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fee structure deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getFeeStatistics = async (req, res) => {
  try {
    const stats = await StudentFee.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' },
          pendingAmount: { $sum: '$pendingAmount' }
        }
      }
    ]);

    const hostelStats = await StudentFee.aggregate([
      {
        $lookup: {
          from: 'hostels',
          localField: 'hostel',
          foreignField: '_id',
          as: 'hostelInfo'
        }
      },
      {
        $unwind: {
          path: '$hostelInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$hostel',
          hostelName: { $first: '$hostelInfo.hostelName' },
          totalStudents: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          collectedAmount: { $sum: '$paidAmount' },
          pendingAmount: { $sum: '$pendingAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: stats,
        byHostel: hostelStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Warden Controllers
exports.verifyTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status, remarks } = req.body;

    const transaction = await Transaction.findById(transactionId)
      .populate('studentFee')
      .populate('student', 'fullName email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    transaction.status = status;
    transaction.remarks = remarks;
    transaction.verifiedBy = req.userId;
    transaction.verificationDate = new Date();

    await transaction.save();

    if (status === 'verified') {
      const studentFee = await StudentFee.findById(transaction.studentFee._id);
      studentFee.paidAmount += transaction.amount;
      studentFee.pendingAmount = studentFee.totalAmount - studentFee.paidAmount;
      
      if (studentFee.pendingAmount <= 0) {
        studentFee.status = 'paid';
      } else {
        studentFee.status = 'partial';
      }

      await studentFee.save();

      // Create notification for student
      await createNotification(
        transaction.student._id,
        'Student',
        'payment_verification',
        'Payment Verified',
        `Your payment of ₹${transaction.amount} has been verified successfully. ${studentFee.pendingAmount > 0 ? `Remaining amount: ₹${studentFee.pendingAmount}` : 'Fee payment completed.'}`,
        transaction._id,
        'Transaction'
      );

      // Send confirmation email
      if (transaction.student && transaction.student.email) {
        try {
          await sendEmail(
            transaction.student.email,
            'Payment Verified',
            `Dear ${transaction.student.fullName},\n\nYour payment of ₹${transaction.amount} has been verified successfully.\n\n${studentFee.pendingAmount > 0 ? `Remaining amount: ₹${studentFee.pendingAmount}` : 'Your fee payment is now complete.'}\n\nThank you.`
          );
        } catch (emailError) {
          console.error('Failed to send payment verification email:', emailError);
        }
      }
    } else if (status === 'rejected') {
      // Create notification for rejected payment
      await createNotification(
        transaction.student._id,
        'Student',
        'payment_verification',
        'Payment Rejected',
        `Your payment of ₹${transaction.amount} has been rejected. ${remarks ? `Reason: ${remarks}` : 'Please contact the warden for more information.'}`,
        transaction._id,
        'Transaction'
      );
    }

    res.status(200).json({
      success: true,
      message: `Transaction ${status} successfully`,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Student Controllers
exports.createTransaction = async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId } = req.body;
    const studentId = req.userId;

    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const studentFee = await StudentFee.findOne({ 
      student: studentId,
      status: { $in: ['pending', 'partial', 'overdue'] }
    })
    .populate('hostel', 'hostelName')
    .sort({ createdAt: -1 });

    if (!studentFee) {
      return res.status(404).json({
        success: false,
        message: 'No pending fees found'
      });
    }

    // Validate amount
    if (parseFloat(amount) > studentFee.pendingAmount) {
      return res.status(400).json({
        success: false,
        message: `Amount cannot exceed pending amount of ₹${studentFee.pendingAmount}`
      });
    }

    // Create payment proof directory if it doesn't exist
    const paymentProofDir = path.join(__dirname, '../../uploads/payment-proofs');
    if (!fs.existsSync(paymentProofDir)) {
      fs.mkdirSync(paymentProofDir, { recursive: true });
    }

    const transaction = new Transaction({
      studentFee: studentFee._id,
      student: studentId,
      amount: parseFloat(amount),
      transactionId,
      paymentMethod,
      paymentProof: req.file ? `/uploads/payment-proofs/${req.file.filename}` : null,
      status: 'pending_verification'
    });

    await transaction.save();

    // Create notification for the student
    await createNotification(
      studentId,
      'Student',
      'payment_verification',
      'Payment Submitted',
      `Your payment of ₹${amount} has been submitted for verification. You will be notified once it's verified.`,
      transaction._id,
      'Transaction'
    );

    // Notify warden about pending payment verification
    if (studentFee.hostel) {
      const hostel = await Hostel.findById(studentFee.hostel._id).populate('wardenId');
      if (hostel && hostel.wardenId) {
        await createNotification(
          hostel.wardenId._id,
          'Warden',
          'payment_verification',
          'New Payment for Verification',
          `${student.fullName} has submitted a payment of ₹${amount} for verification.`,
          transaction._id,
          'Transaction'
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Payment submitted for verification',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Common Controllers
exports.sendReminder = async (req, res) => {
  try {
    const { studentIds, message, type } = req.body;
    const userRole = req.userRole;

    // Check if user is admin or warden
    if (userRole !== 'admin' && userRole !== 'warden') {
      return res.status(403).json({
        success: false,
        message: 'Only admin and warden can send reminders'
      });
    }

    let targetStudentIds = studentIds;

    // If type is 'overdue', find all students with overdue fees
    if (type === 'overdue' && !studentIds) {
      const overdueFees = await StudentFee.find({ 
        status: 'overdue',
        dueDate: { $lt: new Date() }
      }).select('student');
      targetStudentIds = overdueFees.map(fee => fee.student);
    }

    if (!targetStudentIds || targetStudentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No students to send reminders to'
      });
    }

    const reminderMessage = message || 'This is a reminder that your hostel fee payment is due. Please pay on time to avoid penalties.';

    // Create reminders
    const reminders = targetStudentIds.map(studentId => ({
      student: studentId,
      sentBy: req.userId,
      sentByRole: userRole,
      message: reminderMessage,
      type: 'in_app'
    }));

    await Reminder.insertMany(reminders);

    // Create notifications for all students
    const notificationPromises = targetStudentIds.map(studentId =>
      createNotification(
        studentId,
        'Student',
        'fee_reminder',
        'Fee Payment Reminder',
        reminderMessage
      )
    );

    await Promise.all(notificationPromises);

    // Send emails
    const students = await Student.find({ _id: { $in: targetStudentIds } });
    let emailsSent = 0;
    for (const student of students) {
      if (student.email) {
        try {
          await sendEmail(
            student.email,
            'Fee Payment Reminder',
            `Dear ${student.fullName},\n\n${reminderMessage}\n\nThank you.`
          );
          emailsSent++;
        } catch (emailError) {
          console.error(`Failed to send reminder to ${student.email}:`, emailError);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Reminder sent to ${targetStudentIds.length} students (${emailsSent} emails sent)`
    });
  } catch (error) {
    console.error('Error sending reminders:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getStudentFees = async (req, res) => {
  try {
    let filter = {};

    if (req.userRole === 'student') {
      filter.student = req.userId;
    } else if (req.userRole === 'warden') {
      filter.hostel = req.params.hostelId || req.user.hostel;
    }

    const fees = await StudentFee.find(filter)
      .populate('student', 'fullName studentId email roomNumber')
      .populate('hostel', 'hostelName')
      .populate('feeStructure')
      .populate({
        path: 'room',
        select: 'roomNo'
      })
      .sort({ createdAt: -1 });

    const transactions = await Transaction.find({
      studentFee: { $in: fees.map(f => f._id) }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        fees,
        transactions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const { type } = req.params;
    
    // Create a new PDF document
    const doc = new PDFDocument();
    const filename = `fee_report_${type}_${Date.now()}.pdf`;
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Pipe the PDF document to the response
    doc.pipe(res);
    
    // Add header
    doc.fontSize(24).font('Helvetica-Bold').text('Hostel Fee Report', { align: 'center' });
    doc.moveDown(0.5);
    
    // Add report type and date
    doc.fontSize(16).font('Helvetica').text(`Report Type: ${type.charAt(0).toUpperCase() + type.slice(1)}`, { align: 'center' });
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, { align: 'center' });
    doc.moveDown(2);
    
    // Add report data based on type
    if (type === 'monthly') {
      // Get current month data
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const fees = await StudentFee.find({ 
        createdAt: { $gte: startOfMonth }
      })
        .populate('student', 'fullName studentId')
        .populate('hostel', 'hostelName');
      
      doc.fontSize(14).font('Helvetica-Bold').text('Monthly Fee Collection Summary', { underline: true });
      doc.moveDown();
      
      let totalCollected = 0;
      let totalPending = 0;
      
      fees.forEach(fee => {
        doc.fontSize(10).font('Helvetica');
        doc.text(`Student: ${fee.student?.fullName || 'N/A'} (${fee.student?.studentId || 'N/A'})`);
        doc.text(`Hostel: ${fee.hostel?.hostelName || 'N/A'}`);
        doc.text(`Total Amount: ₹${fee.totalAmount.toLocaleString('en-IN')}`);
        doc.text(`Paid: ₹${fee.paidAmount.toLocaleString('en-IN')}`);
        doc.text(`Pending: ₹${fee.pendingAmount.toLocaleString('en-IN')}`);
        doc.text(`Status: ${fee.status}`);
        doc.text(`Due Date: ${new Date(fee.dueDate).toLocaleDateString('en-IN')}`);
        doc.moveDown();
        
        totalCollected += fee.paidAmount;
        totalPending += fee.pendingAmount;
      });
      
      // Add summary
      doc.moveDown();
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`Total Students: ${fees.length}`);
      doc.text(`Total Collected: ₹${totalCollected.toLocaleString('en-IN')}`);
      doc.text(`Total Pending: ₹${totalPending.toLocaleString('en-IN')}`);
      
    } else if (type === 'pending') {
      const fees = await StudentFee.find({ 
        status: { $in: ['pending', 'partial', 'overdue'] }
      })
        .populate('student', 'fullName studentId email mobile')
        .populate('hostel', 'hostelName');
      
      doc.fontSize(14).font('Helvetica-Bold').text('Pending Fee Details', { underline: true });
      doc.moveDown();
      
      let totalPending = 0;
      
      fees.forEach(fee => {
        doc.fontSize(10).font('Helvetica');
        doc.text(`Student: ${fee.student?.fullName || 'N/A'} (${fee.student?.studentId || 'N/A'})`);
        doc.text(`Contact: ${fee.student?.mobile || 'N/A'} | ${fee.student?.email || 'N/A'}`);
        doc.text(`Hostel: ${fee.hostel?.hostelName || 'N/A'}`);
        doc.text(`Total Amount: ₹${fee.totalAmount.toLocaleString('en-IN')}`);
        doc.text(`Paid: ₹${fee.paidAmount.toLocaleString('en-IN')}`);
        doc.text(`Pending: ₹${fee.pendingAmount.toLocaleString('en-IN')}`);
        doc.text(`Status: ${fee.status}`);
        doc.text(`Due Date: ${new Date(fee.dueDate).toLocaleDateString('en-IN')}`);
        if (fee.status === 'overdue') {
          doc.fillColor('red').text('OVERDUE', { underline: true }).fillColor('black');
        }
        doc.moveDown();
        
        totalPending += fee.pendingAmount;
      });
      
      // Add summary
      doc.moveDown();
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`Total Students with Pending Fees: ${fees.length}`);
      doc.text(`Total Pending Amount: ₹${totalPending.toLocaleString('en-IN')}`);
      
    } else if (type === 'hostel') {
      // Hostel-wise report
      const hostelStats = await StudentFee.aggregate([
        {
          $lookup: {
            from: 'hostels',
            localField: 'hostel',
            foreignField: '_id',
            as: 'hostelInfo'
          }
        },
        {
          $unwind: {
            path: '$hostelInfo',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: '$hostel',
            hostelName: { $first: '$hostelInfo.hostelName' },
            hostelType: { $first: '$hostelInfo.hostelType' },
            totalStudents: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            collectedAmount: { $sum: '$paidAmount' },
            pendingAmount: { $sum: '$pendingAmount' }
          }
        }
      ]);
      
      doc.fontSize(14).font('Helvetica-Bold').text('Hostel-wise Fee Collection Report', { underline: true });
      doc.moveDown();
      
      hostelStats.forEach(hostel => {
        doc.fontSize(12).font('Helvetica-Bold').text(`${hostel.hostelName || 'Unknown Hostel'} (${hostel.hostelType || 'N/A'})`);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Total Students: ${hostel.totalStudents}`);
        doc.text(`Total Fee Amount: ₹${hostel.totalAmount.toLocaleString('en-IN')}`);
        doc.text(`Collected: ₹${hostel.collectedAmount.toLocaleString('en-IN')}`);
        doc.text(`Pending: ₹${hostel.pendingAmount.toLocaleString('en-IN')}`);
        doc.text(`Collection Rate: ${((hostel.collectedAmount / hostel.totalAmount) * 100).toFixed(2)}%`);
        doc.moveDown();
      });
      
    } else if (type === 'annual') {
      // Annual summary
      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1);
      const endOfYear = new Date(currentYear, 11, 31);
      
      const fees = await StudentFee.find({
        createdAt: { $gte: startOfYear, $lte: endOfYear }
      });
      
      const transactions = await Transaction.find({
        createdAt: { $gte: startOfYear, $lte: endOfYear },
        status: 'verified'
      });
      
      doc.fontSize(14).font('Helvetica-Bold').text(`Annual Fee Summary - ${currentYear}`, { underline: true });
      doc.moveDown();
      
      const totalAmount = fees.reduce((sum, fee) => sum + fee.totalAmount, 0);
      const totalCollected = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);
      const totalPending = fees.reduce((sum, fee) => sum + fee.pendingAmount, 0);
      
      doc.fontSize(12).font('Helvetica');
      doc.text(`Total Fee Structures Created: ${fees.length}`);
      doc.text(`Total Expected Revenue: ₹${totalAmount.toLocaleString('en-IN')}`);
      doc.text(`Total Collected: ₹${totalCollected.toLocaleString('en-IN')}`);
      doc.text(`Total Pending: ₹${totalPending.toLocaleString('en-IN')}`);
      doc.text(`Collection Rate: ${((totalCollected / totalAmount) * 100).toFixed(2)}%`);
      doc.text(`Total Transactions: ${transactions.length}`);
      doc.moveDown();
      
      // Monthly breakdown
      doc.fontSize(12).font('Helvetica-Bold').text('Monthly Breakdown:', { underline: true });
      doc.moveDown();
      
      const monthlyData = {};
      transactions.forEach(txn => {
        const month = new Date(txn.createdAt).toLocaleString('en-IN', { month: 'long' });
        monthlyData[month] = (monthlyData[month] || 0) + txn.amount;
      });
      
      Object.entries(monthlyData).forEach(([month, amount]) => {
        doc.fontSize(10).font('Helvetica');
        doc.text(`${month}: ₹${amount.toLocaleString('en-IN')}`);
      });
    }
    
    // Add footer
    doc.moveDown(3);
    doc.fontSize(10).font('Helvetica').fillColor('gray');
    doc.text('This is a system generated report', { align: 'center' });
    doc.text(`Report generated by: ${req.userRole.charAt(0).toUpperCase() + req.userRole.slice(1)}`, { align: 'center' });
    
    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Check for overdue fees and update status (can be called by a cron job)
exports.checkOverdueFees = async () => {
  try {
    const now = new Date();
    
    // Find all fees that are past due date but not fully paid
    const overdueFees = await StudentFee.find({
      dueDate: { $lt: now },
      status: { $in: ['pending', 'partial'] }
    }).populate('student', 'fullName email');
    
    for (const fee of overdueFees) {
      fee.status = 'overdue';
      await fee.save();
      
      // Create notification for student
      await createNotification(
        fee.student._id,
        'Student',
        'fee_reminder',
        'Fee Payment Overdue',
        `Your hostel fee payment of ₹${fee.pendingAmount} is overdue. Please pay immediately to avoid penalties.`,
        fee._id,
        'StudentFee'
      );
      
      // Send email if possible
      if (fee.student.email) {
        try {
          await sendEmail(
            fee.student.email,
            'Urgent: Fee Payment Overdue',
            `Dear ${fee.student.fullName},\n\nYour hostel fee payment of ₹${fee.pendingAmount} is overdue. Please pay immediately to avoid penalties.\n\nThank you.`
          );
        } catch (emailError) {
          console.error('Failed to send overdue email:', emailError);
        }
      }
    }
    
    console.log(`Updated ${overdueFees.length} fees to overdue status`);
  } catch (error) {
    console.error('Error checking overdue fees:', error);
  }
};
