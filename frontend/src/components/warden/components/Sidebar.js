import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeSection, setActiveSection, collapsed, setCollapsed, wardenData }) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: '📊' },
    { id: 'students', label: 'Student Management', icon: '👩‍🎓' },
    { id: 'rooms', label: 'Room Management', icon: '🏠' },
    { id: 'fees', label: 'Fee Management', icon: '💰' },
    { id: 'complaints', label: 'Complaints', icon: '🧾' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-header">
        <div className="logo-container">
          <h2 className="logo-text">
            {collapsed ? 'W' : 'Warden'}<span>Panel</span>
          </h2>
        </div>
        <button 
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Warden Info */}
      {wardenData && !collapsed && (
        <div className="warden-info-section">
          <div className="warden-avatar">
            {wardenData.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="warden-details">
            <h3>{wardenData.fullName}</h3>
            <p>{wardenData.designation?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {navigationItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => setActiveSection(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            <div className="nav-indicator"></div>
          </div>
        ))}
      </nav>

      {/* Footer
      <div className="sidebar-footer">
        <div className="footer-content">
          <button 
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login/warden';
            }}
          >
            <span>🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div> */}
    </aside>
  );
};

export default Sidebar;
