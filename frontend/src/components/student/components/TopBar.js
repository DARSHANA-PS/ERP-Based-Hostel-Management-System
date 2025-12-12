import React, { useState, useEffect } from 'react';
import './TopBar.css';

const TopBar = ({ onLogout, notifications, darkMode, setDarkMode }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStudentData(data.data);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  return (
    <header className="student-topbar">
      {/* Welcome Section */}
      <div className="topbar-left">
        <h2 className="welcome-text">
          Welcome back, <span className="student-name">{studentData?.fullName || user.fullName}!</span>
        </h2>
        <p className="welcome-subtitle">Manage your hostel life easily from here</p>
      </div>

      {/* Right Section */}
      <div className="topbar-right">
        {/* Dark Mode Toggle */}
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '🌙' : '☀️'}
        </button>

        {/* Notifications */}
        <div className="notification-container">
          <button
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <span>🔔</span>
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="dropdown-header">
                <h3>Notifications</h3>
              </div>
              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map((notif, index) => (
                    <div key={index} className="notification-item">
                      <p>{notif.message}</p>
                      <span className="notif-time">{notif.time}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-notifications">No new notifications</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="profile-container">
          <button
            className="profile-btn"
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className="profile-avatar">
              {studentData?.photo ? (
                <img src={studentData.photo} alt="Profile" />
              ) : (
                <span>{(studentData?.fullName || user.fullName || 'S').charAt(0)}</span>
              )}
            </div>
            <span className="dropdown-icon">▼</span>
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <a href="#profile" className="dropdown-item">
                <span>👤</span>
                View Profile
              </a>
              <a href="#settings" className="dropdown-item">
                <span>⚙️</span>
                Settings
              </a>
              <div className="dropdown-divider"></div>
              <button onClick={onLogout} className="dropdown-item logout">
                <span>🚪</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
