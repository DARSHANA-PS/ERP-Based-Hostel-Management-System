import React, { useState, useEffect } from 'react';
import './TopBar.css';

const TopBar = ({ onLogout, notifications, searchQuery, setSearchQuery }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="topbar">
      {/* Left Section */}
      <div className="topbar-left">
        <div className="search-container" data-aos="fade-down">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search students, rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="topbar-right">
        {/* Date & Time */}
        <div className="datetime" data-aos="fade-down" data-aos-delay="100">
          <span className="date">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
          <span className="time">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>

        {/* Notifications */}
        <div className="notification-container" data-aos="fade-down" data-aos-delay="200">
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
                <button className="mark-all">Mark all as read</button>
              </div>
              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map((notif, index) => (
                    <div key={index} className="notification-item">
                      <span className="notif-icon">📢</span>
                      <div className="notif-content">
                        <p>{notif.message}</p>
                        <span className="notif-time">{notif.time}</span>
                      </div>
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
        <div className="profile-container" data-aos="fade-down" data-aos-delay="300">
          <button
            className="profile-btn"
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className="profile-avatar">
              <span>👤</span>
            </div>
            <div className="profile-info">
              <span className="profile-name">{user.fullName || 'Admin'}</span>
              <span className="profile-role">Administrator</span>
            </div>
            <span className="dropdown-icon">▼</span>
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <a href="#profile" className="dropdown-item">
                <span>👤</span>
                My Profile
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
