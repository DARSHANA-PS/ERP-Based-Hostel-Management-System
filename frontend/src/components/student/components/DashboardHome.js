import React, { useState, useEffect } from 'react';
import { studentAPI } from '../../../services/api';
import './DashboardHome.css';

const DashboardHome = () => {
  const [studentData, setStudentData] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch student profile
      const profileData = await studentAPI.getProfile();
      setStudentData(profileData.data);
      
      // Fetch room details
      const roomDetails = await studentAPI.getRoomDetails();
      setRoomData(roomDetails.data);
      
      // Mock announcements (replace with actual API call when available)
      setAnnouncements([
        {
          id: 1,
          title: 'Water supply maintenance on 30th Oct',
          content: 'Water supply will be interrupted from 10 AM–12 PM.',
          date: '2025-10-28',
          type: 'maintenance'
        },
        {
          id: 2,
          title: 'Mess menu updated for November',
          content: 'New mess menu has been updated. Check the mess section.',
          date: '2025-10-25',
          type: 'info'
        }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardCards = [
    {
      id: 'profile',
      title: 'Profile',
      icon: '👤',
      content: studentData ? (
        <>
          <p className="card-main">{studentData.fullName}</p>
          <p className="card-sub">Roll No: {studentData.studentId}</p>
          <p className="card-sub">{studentData.course} - {studentData.gender}</p>
        </>
      ) : 'Loading...',
      action: 'View Full Profile',
      color: 'profile'
    },
    {
      id: 'hostel',
      title: 'Hostel Info',
      icon: '🏡',
      content: studentData ? (
        <>
          <p className="card-main">{studentData.hostelName || 'Not Assigned'}</p>
          <p className="card-sub">Type: {studentData.gender} Hostel</p>
          <p className="card-sub">Warden: Contact at reception</p>
        </>
      ) : 'Loading...',
      action: 'View Hostel Details',
      color: 'hostel'
    },
    {
      id: 'room',
      title: 'Room Info',
      icon: '🛏',
      content: roomData ? (
        <>
          <p className="card-main">Room {roomData.roomNumber}</p>
          <p className="card-sub">{studentData?.roomType || 'Sharing'} Type</p>
          <p className="card-sub">Bed: {roomData.bedNumber || 'Not Assigned'}</p>
        </>
      ) : 'Loading...',
      action: 'View Room Details',
      color: 'room'
    },
    {
      id: 'fees',
      title: 'Fee Status',
      icon: '💰',
      content: (
        <>
          <p className="card-main">₹10,000</p>
          <p className="card-sub">Total Fees</p>
          <p className="card-sub pending">Pending: ₹5,000</p>
        </>
      ),
      action: 'Pay Now',
      color: 'fees'
    },
    {
      id: 'complaints',
      title: 'Complaints',
      icon: '📩',
      content: (
        <>
          <p className="card-main">2</p>
          <p className="card-sub">Active Complaints</p>
          <p className="card-sub">Resolved: 5</p>
        </>
      ),
      action: 'Raise New Complaint',
      color: 'complaints'
    },
    {
      id: 'announcements',
      title: 'Announcements',
      icon: '📢',
      content: (
        <>
          <p className="card-main">{announcements.length}</p>
          <p className="card-sub">New Notices</p>
          <p className="card-sub">Latest: Today</p>
        </>
      ),
      action: 'View All Notices',
      color: 'announcements'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      {/* Welcome Section */}
      <div className="welcome-section" data-aos="fade-down">
        <h1>Welcome back, {studentData?.fullName}!</h1>
        <p>Here's your hostel overview at a glance</p>
      </div>

      {/* Dashboard Cards */}
      <div className="dashboard-cards">
        {dashboardCards.map((card, index) => (
          <div 
            key={card.id}
            className={`dashboard-card ${card.color}`}
            data-aos="zoom-in"
            data-aos-delay={index * 100}
          >
            <div className="card-header">
              <span className="card-icon">{card.icon}</span>
              <h3>{card.title}</h3>
            </div>
            <div className="card-content">
              {card.content}
            </div>
            <button className="card-action">
              {card.action} →
            </button>
          </div>
        ))}
      </div>

      {/* Recent Announcements */}
      <div className="announcements-section" data-aos="fade-up">
        <div className="section-header">
          <h2>Recent Announcements</h2>
          <a href="#announcements" className="view-all">View All</a>
        </div>
        <div className="announcements-list">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="announcement-card">
              <div className="announcement-icon">
                {announcement.type === 'maintenance' ? '🔧' : '📢'}
              </div>
              <div className="announcement-content">
                <h4>{announcement.title}</h4>
                <p>{announcement.content}</p>
                <span className="announcement-date">
                  {new Date(announcement.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions" data-aos="fade-up">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="quick-action-btn">
            <span>📝</span>
            Request Room Change
          </button>
          <button className="quick-action-btn">
            <span>🍽️</span>
            Update Mess Preferences
          </button>
          <button className="quick-action-btn">
            <span>📄</span>
            Download Fee Receipt
          </button>
          <button className="quick-action-btn">
            <span>📞</span>
            Contact Warden
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
