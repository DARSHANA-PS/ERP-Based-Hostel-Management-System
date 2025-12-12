const cron = require('node-cron');
const { StudentFee, Reminder } = require('../models/Fee');
const Student = require('../models/Student');
const { sendEmail } = require('./emailService');

// Run every day at 9 AM - Check for upcoming due dates
cron.schedule('0 9 * * *', async () => {
  try {
    console.log('Running fee reminder cron job...');
    
    // Find fees due in 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    threeDaysFromNow.setHours(23, 59, 59, 999);

    const upcomingDueFees = await StudentFee.find({
      dueDate: {
        $gte: today,
        $lte: threeDaysFromNow
      },
      status: { $in: ['pending', 'partial'] }
    }).populate('student');

    // Send reminders
    for (const fee of upcomingDueFees) {
      if (fee.student && fee.student.email) {
        try {
          await sendEmail(
            fee.student.email,
            'Fee Payment Reminder',
            `Dear ${fee.student.fullName}, your hostel fee payment of ₹${fee.pendingAmount} is due on ${fee.dueDate.toLocaleDateString()}. Please pay on time to avoid late fees.`
          );

          await Reminder.create({
            studentFee: fee._id,
            student: fee.student._id,
            sentBy: 'system',
            sentByRole: 'admin',
            message: 'Automatic reminder: Fee payment due soon',
            type: 'email',
            status: 'sent'
          });

          console.log(`Sent reminder to ${fee.student.fullName}`);
        } catch (error) {
          console.error(`Failed to send reminder to ${fee.student.fullName}:`, error);
        }
      }
    }

    console.log(`✅ Sent ${upcomingDueFees.length} fee reminders`);
  } catch (error) {
    console.error('❌ Error in fee reminder cron job:', error);
  }
});

// Run every day at 12 AM - Check for overdue fees
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Running overdue fee check cron job...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updated = await StudentFee.updateMany(
      {
        dueDate: { $lt: today },
        status: { $in: ['pending', 'partial'] }
      },
      { status: 'overdue' }
    );

    console.log(`✅ Updated ${updated.modifiedCount} fees to overdue status`);
  } catch (error) {
    console.error('❌ Error updating overdue fees:', error);
  }
});

// Run every Monday at 10 AM - Send weekly summary to admin
cron.schedule('0 10 * * 1', async () => {
  try {
    console.log('Running weekly fee summary cron job...');
    
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

    const Admin = require('../models/Admin');
    const admins = await Admin.find({});

    for (const admin of admins) {
      if (admin.email) {
        const summaryText = stats.map(s => 
          `${s._id}: ${s.count} students, Total: ₹${s.totalAmount}, Paid: ₹${s.paidAmount}, Pending: ₹${s.pendingAmount}`
        ).join('\n');

        await sendEmail(
          admin.email,
          'Weekly Fee Collection Summary',
          `Weekly Fee Summary:\n\n${summaryText}`
        );
      }
    }

    console.log('✅ Sent weekly summary to admins');
  } catch (error) {
    console.error('❌ Error in weekly summary cron job:', error);
  }
});

console.log('✅ Cron jobs scheduled:');
console.log('   - Daily fee reminders at 9:00 AM');
console.log('   - Daily overdue check at 12:00 AM');
console.log('   - Weekly summary every Monday at 10:00 AM');
