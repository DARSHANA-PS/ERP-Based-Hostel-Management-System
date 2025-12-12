import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeSection, setActiveSection, collapsed, setCollapsed }) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'hostel', label: 'Hostel Info', icon: '🏡' },
    { id: 'room', label: 'My Room', icon: '🛏' },
    { id: 'fees', label: 'Fees & Payments', icon: '💰' },
    { id: 'announcements', label: 'Notices', icon: '📢' },
    { id: 'complaints', label: 'Raise Complaint', icon: '📩' },
    { id: 'contact', label: 'Help / Contact', icon: '📞' }
  ];

  return (
    <aside className={`student-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-header">
        <div className="logo-container">
          <h2 className="logo-text">
            {collapsed ? 'S' : 'Student'}<span>Portal</span>
          </h2>
        </div>
        <button 
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

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
          </div>
        ))}
      </nav>

      {/* Logout
      <div className="sidebar-footer">
        <div 
          className="nav-item logout"
          onClick={() => window.location.href = '/logout'}
        >
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Logout</span>
        </div>
      </div> */}
    </aside>
  );
};

export default Sidebar;
